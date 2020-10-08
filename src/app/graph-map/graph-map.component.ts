import {Component, OnInit} from '@angular/core';
import * as d3 from "d3";
import { Node } from "../vdma_classes/Node";
import { Edge } from "../vdma_classes/Edge";
import { Route } from "../vdma_classes/Route";
import { FTF } from "../vdma_classes/FTF";
import * as Paho from "paho-mqtt";
import {SettingsFormComponent} from "../settings-form/settings-form.component";
import {FtfFormComponent} from "../ftf-form/ftf-form.component";
import {MatDialog, MatDialogConfig, MatSnackBar} from "@angular/material";
import {EdgeFormComponent} from '../edge-form/edge-form.component';
import Message = Paho.Message;

// WORKAROUND FÜR NAMESPACE BUG https://github.com/eclipse/paho.mqtt.javascript/issues/150
(<any>window).Paho = Paho;
(<any>window).Paho.MQTT = Paho;

@Component({
  selector: 'app-graph-map',
  templateUrl: './graph-map.component.html',
  styleUrls: ['./graph-map.component.css']
})

export class GraphMapComponent implements OnInit {
  // Stuff um routen, nodes und edges zu verwalten
  nodes: Node[] = [];
  currentRoute = new Route();
  routes: Route[] = [this.currentRoute];
  edges: Edge[] = [];
  coordinateSystem = {
    x: 0,
    y: 0
  };

  // Stuff für Flottenverwaltung
  ftfs: FTF[] = [];


  // Stuff für Maus-Events
  buttonDownNode: Node = null;
  buttonUpNode: Node = null;
  selectedNode: Node = null;
  selectedEdge: Edge;
  svgActive: boolean = false;

  // Tastaturevents
  lastKeyDown: number = -1;

  // D3 JS Handles
  //@ts-ignore
  stage: d3.Selection;
  //@ts-ignore
  circleGroup: d3.Selection;
  //@ts-ignore
  edgeGroup: d3.Selection;
  //@ts-ignore
  ftfGroup: d3.Selection;
  //@ts-ignore
  textGroup: d3.Selection;
  //@ts-ignore
  dragLine: d3.Selection;
  colors = d3.scaleOrdinal(d3.schemeCategory10);

  // MQTT Client
  mqtt: Paho.Client;
  mqttHost = '127.0.0.1';
  mqttPort = 1884;
  mqttClientID = 'VDMA_FTF_PROTO_WEBAPP_' + Math.random().toString(36).substr(2,6);
  mqttConnected = false;
  mqttManuallyDisconnected = false;


  // MapStuff
  mapWidthInPixels=701;
  mapHeightInPixels=489;
  map_origin = [-17.5250000, -12.2250000];
  mapWidthInMeters = 35.05;
  mapHeightInMeters = 24.45;
  mapMetersPerPixel = 0.05;
  mapAvailableWidth: number;
  mapAvailableHeight: number;
  mapSizingFactor: number;
  mapDisplayWidth: number;
  mapDisplayHeight: number;
  mapXoffset = 0.0;
  mapYoffset = 0.0;
  xScale = d3.scaleLinear()
    .domain([this.map_origin[0], -this.map_origin[0] ])
    .range([0,this.mapWidthInPixels]);
  yScale = d3.scaleLinear()
    .domain([-this.map_origin[1], this.map_origin[1]])
    .range([0,this.mapHeightInPixels]);


  // Component visibility
  routeFormVisible = true;
  ftfListVisible = false;



  constructor(private settingsDialog: MatDialog,
              private snackBar: MatSnackBar,
              private ftfDialog: MatDialog,
              private edgeDialog: MatDialog) { }

  ngOnInit() {
    // Hier die App starten!
    this.initSvg();
    this.drawCircles();
    this.stage.on('mouseup', this.addNodes.bind(this));
    d3.select(window)
      .on('keydown', this.keyDown.bind(this))
      .on('keyup', this.keyUp.bind(this))
      .on('mousedown', () => {
        this.svgActive = false;
      });
    this.loadMQTTSettings();
    this.initMQTT();
    // @ts-ignore Route mit Farbe versehen
    this.currentRoute.color = this.colors(this.currentRoute.routeID);
  }

  loadMQTTSettings() {
    if (localStorage.getItem('mqttHost')) {
      this.mqttHost = localStorage.getItem('mqttHost');
    }
    if (localStorage.getItem('mqttPort')) {
      this.mqttPort = Number(localStorage.getItem('mqttPort'));
    }
    if (localStorage.getItem('mqttClientID')) {
      this.mqttClientID = localStorage.getItem('mqttClientID');
    }
  }

  saveMQTTSettings() {
    localStorage.setItem('mqttHost', this.mqttHost);
    localStorage.setItem('mqttPort', this.mqttPort.toString());
    localStorage.setItem('mqttClientID', this.mqttClientID);
  }

  initMQTT() {
    this.mqtt = new Paho.Client(this.mqttHost, this.mqttPort, this.mqttClientID);
    this.mqtt.connect({onSuccess: this.onMQTTConnect.bind(this),
      onFailure: this.onMQTTError.bind(this)
    });
    this.mqtt.onMessageArrived = this.onMQTTMessage.bind(this);
    this.mqtt.onConnectionLost = this.onMQTTConnectionLost.bind(this);
  }

  initScales() {
    this.mapWidthInMeters = this.mapWidthInPixels * this.mapMetersPerPixel;
    this.mapHeightInMeters = this.mapHeightInPixels * this.mapMetersPerPixel;

    this.xScale = d3.scaleLinear()
      .domain([-this.mapWidthInMeters/2 - this.mapXoffset, this.mapWidthInMeters/2 - this.mapXoffset])
      .range([0,this.mapDisplayWidth]);

    this.yScale = d3.scaleLinear()
      .domain([this.mapHeightInMeters/2 - this.mapYoffset, -this.mapHeightInMeters/2 - this.mapYoffset])
      .range([0,this.mapDisplayHeight]);

    console.log('Kartenmaße: ' + this.mapWidthInPixels + 'x' + this.mapHeightInPixels + ' (px) '
    + this.mapWidthInMeters + 'x' + this.mapHeightInMeters + ' (m) Auflösung:' + this.mapMetersPerPixel);
  }

  calculateMapDisplaySettings() {
    this.mapAvailableWidth = window.innerWidth;
    this.mapAvailableHeight = window.innerHeight - 70;  // To account for toolbar
    let mapWidthSizingFactor = this.mapAvailableWidth / this.mapWidthInPixels;
    let mapHeightSizingFactor = this.mapAvailableHeight / this.mapHeightInPixels;
    if (mapWidthSizingFactor < mapHeightSizingFactor ) {
      // Map fills Width before height, so use width!
      this.mapSizingFactor = mapWidthSizingFactor;
      this.mapDisplayWidth = this.mapAvailableWidth;
      this.mapDisplayHeight = this.mapHeightInPixels * this.mapSizingFactor;
    }
    else {
      // Map fills Height before width!
      this.mapSizingFactor = mapHeightSizingFactor;
      this.mapDisplayWidth = this.mapWidthInPixels * this.mapSizingFactor;
      this.mapDisplayHeight = this.mapAvailableHeight;
    }
    this.initScales();
  }

  loadCustomMap() {
    let customMap = window.localStorage.getItem('customMap');
    if (customMap !== null) {
      let stage = document.getElementById('stage');
      let image = new Image();
      image.src = customMap;
      image.onload = () => {
        stage.setAttribute('style', "background-image: url('"+ customMap + "')");
        this.mapWidthInPixels = image.width;
        this.mapHeightInPixels = image.height;
        this.calculateMapDisplaySettings();
        this.setStageSizeToDisplaySettings();
        this.initScales();
      };
    }
    if (localStorage.getItem('mapMetersPerPixel')) {
      this.mapMetersPerPixel = Number(localStorage.getItem('mapMetersPerPixel'));
      this.initScales();
    }
  }

  setStageSizeToDisplaySettings() {
    let stage = document.getElementById('stage');
    stage.setAttribute('width', this.mapDisplayWidth + 'px');
    stage.setAttribute('height', this.mapDisplayHeight + 'px');
  }

  initSvg() {
    // load background picture from local storage if there is one
    this.loadCustomMap();
    this.calculateMapDisplaySettings();
    this.setStageSizeToDisplaySettings();


    this.stage = d3.select('#stage');
    this.edgeGroup = this.stage.append('svg:g');
    this.ftfGroup = this.stage.append('svg:g');
    this.circleGroup = this.stage.append('svg:g');

    this.circleGroup.attr('id', 'nodes');
    this.edgeGroup.attr('id', 'edges');
    this.ftfGroup.attr('id', 'ftfs');

    this.stage
      .append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

    this.stage
      .append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

    this.stage
      .append('svg:defs').append('svg:symbol')
      .attr('id', 'FTF')
      .append('svg:path')
      .attr('fill', '#FF0000');

    // Stuff for FTF Symbols and Power Indicator
    this.stage
      .append('svg:defs')
      .append('svg:line')
      .attr('id', "powerBackground")
      .attr('x1',-52)
      .attr('y1',0)
      .attr('x2',52)
      .attr('y2',0)
      .attr('style',"stroke: #000000; stroke-width: 12px");

    this.stage
      .append('svg:defs')
      .append('svg:line')
      .attr('id',"power")
      .attr('x1',-50)
      .attr('y1',0)
      .attr('x2',50)
      .attr('y2',0)
      .attr('style',"stroke: #00FF00; stroke-width: 9px")
      .attr('transform',"scale(0.3)");

    this.stage
      .append('svg:defs')
      .append('svg:line')
      .attr('id',"powerLost")
      .attr('x1',-50)
      .attr('y1',0)
      .attr('x2',50)
      .attr('y2',0)
      .attr('style',"stroke: #FF0000; stroke-width: 9px");

    const powerBarGroup = this.stage
      .append('svg:defs')
      .append('svg:g')
      .attr('id', 'powerBar')
      .attr('transform', 'scale(0.3)');

    powerBarGroup.append('svg:use')
      .attr('xlink:href',"#powerBackground");

    const ftfBody = this.stage
      .append('svg:defs')
      .append('svg:g')
      .attr('id', 'ftfBody')
      .attr('transform', 'scale(0.3)');

    ftfBody.append('svg:rect')
      .attr('x',-50)
      .attr('y',-40)
      .attr('width',100)
      .attr('height',80)
      .attr('style',"stroke: #000000; stroke-width: 4px; fill: #FF0000;");

    ftfBody.append('svg:rect')
      .attr('x',-50)
      .attr('y',-40)
      .attr('width',15)
      .attr('height',80)
      .attr('style',"stroke: #000000; stroke-width: 4px; fill: #000000;");

    this.drawCoordinateSystem();

  }

  drawCircles() {
    let module = this;
    let circle = this.circleGroup.selectAll('g').data(this.nodes, (d: Node) => d.nodeID);


    // update existing circles
    circle
      .selectAll('circle')
      .style('fill', (d) => (d === this.selectedNode) ? d3.rgb(this.colors(d.routeID)).brighter().toString() : this.colors(d.routeID))
      .style('fill-opacity', (d: Node) => d.released ? 1 : 0.6);

    // delete old circles
    circle
      .exit().remove();

    // update position
    circle.attr('transform', function(d) {
      return "translate(" + module.xScale(d.position.x) + "," + module.yScale(d.position.y) + ")";
    });

    // update names
    circle.selectAll('.idText')
      .text((d: Node) => {
        let text = d.nodeDescription;
        if (d.start) return text + '-S';
        else if (d.end) return text + '-E';
        else return text;
      });

    circle.selectAll('line')
      .attr('transform', (d) => {return 'rotate(' + (-d.position.theta * (180 / 3.1415926)) + ')';});

    circle.selectAll('.material-icons')
      .text((d: Node) => {
        let text = '';
        if (d.actions.length > 0) {
          text = 'star_border';
        }
        return text;
      });

    const g = circle.enter().append('svg:g');
    g.append('circle')
      .attr('r', 10)
      .style('fill', (d) => (d === this.selectedNode) ? d3.rgb(this.colors(d.routeID)).brighter().toString() : this.colors(d.routeID))
      .style('stroke', (d) => d3.rgb(this.colors(d.routeID)).darker().toString())
      .style('fill-opacity', (d: Node) => d.released ? 1 : 0.6);

    g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'idText')
      .style('font', '12px sans-serif')
      .style('pointer-events', 'none')
      .style('text-anchor', 'middle')
      .style('font-weight','bold')
      .text((d: Node) => {
        let text = d.nodeDescription;
        if (d.start) return text + '-S';
        else if (d.end) return text + '-E';
        else return text;
      });

    g.append('svg:text')
      .attr('class', 'material-icons')
      .attr('style', 'font-size: 18px;')
      .attr('x', 4)
      .attr('y', -4)
      .text((d: Node) => {
        let text = '';
        if (d.actions.length > 0) {
          text = 'star_border';
        }
        return text;
      });

    g.append('line')
      .attr('x1', 10)
      .attr('y1', 0)
      .attr('x2', 16)
      .attr('y2', 0)
      .attr('transform', (d) => {return 'rotate(' + (-d.position.theta * (180 / 3.1415926)) + ')';})
      .attr('style', 'stroke-width: 4px;stroke: #000000;');

    g.attr('transform', function(d) {
        return "translate(" + module.xScale(d.position.x) + "," + module.yScale(d.position.y) + ")";
      })
      .on('mousedown', (d) => {
        this.svgActive = true;
        this.selectedNode = d;

      })
      .on('mouseup', (d) => {
        this.svgActive = true;
        d3.event.stopPropagation();
        this.buttonUpNode = d;
        if (this.buttonDownNode === this.buttonUpNode) {
          this.selectedNode = d;
          console.log(this.selectedNode);

        }
        else {
          this.addEdge(this.buttonDownNode, this.buttonUpNode);
        }

        this.buttonUpNode = null;
        this.buttonDownNode = null;
        this.drawCircles();
        this.drawEdges();
      });

    this.circleGroup.selectAll('g')
      .call(d3.drag()
        .subject(function(d) {
          // @ts-ignore
          return {x: module.xScale(d.x), y: module.yScale(d.y)};
        })
        .on("drag", this.dragFunc.bind(this)));
  }

  addNodes() {
    //@ts-ignore
    this.svgActive = true;
    if (this.selectedNode !== null) {
      this.selectedNode = null;
      this.drawCircles();
      this.drawEdges();
      return;
    }
    let coords = d3.mouse(document.getElementById('stage'));
    const node = new Node();
    node.position.x = this.xScale.invert(coords[0]);
    node.position.y = this.yScale.invert(coords[1]);
    node.routeID = this.currentRoute.routeID;

    // check if route already has a start
    if (this.currentRoute.nodes.length == 0) {
      node.start = true;
      this.currentRoute.startNode = node;
    }
    else if (this.currentRoute.nodes.length == 1) {
      node.end = true;
      this.currentRoute.endNode = node;
    }
    else {
      node.end = true;
      this.currentRoute.nodes[this.currentRoute.nodes.length - 1].end = false;
      this.currentRoute.endNode = node;
    }

    this.nodes.push(node);
    this.currentRoute.nodes.push(node);

    // automatically add edge between nodes, but only if they are on the same route!
    if (this.currentRoute.nodes.length > 1) {
      this.addEdge(
        this.currentRoute.nodes[this.currentRoute.nodes.length - 2],
        this.currentRoute.nodes[this.currentRoute.nodes.length - 1]
      );
    }

    this.drawCircles();
    this.drawEdges();
    console.log(this.nodes);
    console.log(this.currentRoute);
  }

  dragFunc(d) {
    d.position.x = this.xScale.invert(d3.event.x);
    d.position.y = this.yScale.invert(d3.event.y);

    this.drawCircles();
    this.drawEdges();
    //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  drawEdges() {
    let module = this;
    let edge = this.edgeGroup.selectAll('path').data(this.edges, (d) => d.edgeID);
    // Remove old edges
    edge.exit().remove();

    // Update old edges
    edge
      .attr('d', (d: Edge) => {
        const deltaX = this.xScale(d.endNodeObject.position.x) - this.xScale(d.startNodeObject.position.x);
        const deltaY = this.yScale(d.endNodeObject.position.y) - this.yScale(d.startNodeObject.position.y);
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normX = deltaX / dist;
        const normY = deltaY / dist;
        //const sourcePadding = d.left ? 17 : 12;
        //const targetPadding = d.right ? 17 : 12;
        const sourcePadding = 10;
        const targetPadding = 10;
        const sourceX = this.xScale(d.startNodeObject.position.x) + (sourcePadding * normX);
        const sourceY = this.yScale(d.startNodeObject.position.y) + (sourcePadding * normY);
        const targetX = this.xScale(d.endNodeObject.position.x) - (targetPadding * normX);
        const targetY = this.yScale(d.endNodeObject.position.y) - (targetPadding * normY);
        const deltaXreal = d.endNodeObject.position.x - d.startNodeObject.position.x;
        const deltaYreal = d.endNodeObject.position.y - d.startNodeObject.position.y;
        d.distance = Math.sqrt(deltaXreal * deltaXreal + deltaYreal * deltaYreal);
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      })
      .style('stroke-opacity', (d: Edge) => {
        if (d.startNodeObject.released && d.endNodeObject.released) {
          d.released = true;
          return "1"
        }
        else {
          d.released = false;
          return "0.2";
        }
      });

    edge.enter().append('path')
      .attr('d', (d: Edge) => {
      const deltaX = this.xScale(d.endNodeObject.position.x) - this.xScale(d.startNodeObject.position.x);
      const deltaY = this.yScale(d.endNodeObject.position.y) - this.yScale(d.startNodeObject.position.y);
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX = deltaX / dist;
      const normY = deltaY / dist;
      //const sourcePadding = d.left ? 17 : 12;
      //const targetPadding = d.right ? 17 : 12;
      const sourcePadding = 12;
      const targetPadding = 12;
      const sourceX = this.xScale(d.startNodeObject.position.x) + (sourcePadding * normX);
      const sourceY = this.yScale(d.startNodeObject.position.y) + (sourcePadding * normY);
      const targetX = this.xScale(d.endNodeObject.position.x) - (targetPadding * normX);
      const targetY = this.yScale(d.endNodeObject.position.y) - (targetPadding * normY);
      const deltaXreal = d.endNodeObject.position.x - d.startNodeObject.position.x;
      const deltaYreal = d.endNodeObject.position.y - d.startNodeObject.position.y;
      d.distance = Math.sqrt(deltaXreal * deltaXreal + deltaYreal * deltaYreal);
      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    })
    .on('mouseup', (e: Edge) => {
      d3.event.stopPropagation();
      if (this.lastKeyDown === 17) {
        // Control key held!
        // maybe add trajectory config mode?
      }
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "600px";
      dialogConfig.data = Object.assign({}, e);

      const edgeDialogRef = this.edgeDialog.open(EdgeFormComponent, dialogConfig);
      edgeDialogRef.afterClosed().subscribe(result => {
        if (result) {
          Object.assign(e, result);
        }
      });
    });
  }

  addEdge(source: Node, target: Node) {
    if (source === target) return;
    if (source === null || target === null) return;
    if (source.routeID != target.routeID) return;

    const edge = new Edge(source.nodeID, target.nodeID);
    
    // provisorisch
    edge.startNodeObject = source;
    edge.endNodeObject = target;
    
    edge.edgeDescription = 's' + source.nodeID.toString() + 't' + target.nodeID.toString();
    if (this.edges.find((e: Edge) => {
      return e.edgeDescription == edge.edgeDescription;
    }) != null) {
      console.log("Edge already existent!");
      return;
    }
    else {
      this.edges.push(edge);
      this.currentRoute.edges.push(edge);
      console.log('Added edge. Source:' + source.nodeID + ' Target:' + target.nodeID);
      console.log(this.edges);
      this.drawEdges();

      // adjust theta of source node to point in target direction
      let xDiff = target.position.x - source.position.x;
      let yDiff = target.position.y - source.position.y;
      let theta =  Math.atan2(yDiff, xDiff);
      source.position.theta = theta;
      this.drawCircles();
    }
  }

  addRoute() {

    // get start and end point
    let startNodes = this.currentRoute.nodes.filter((n) => {
      return n.start;
    });
    if (startNodes.length < 1) {
      console.log('NO START POINT DEFINED IN CURRENT ROUTE!');
      this.snackBar.open('Kein Startpunkt in aktueller Route definiert. Bitte korrigieren.', 'OK');
      return;
    }
    else if (startNodes.length > 1) {
      console.log('MORE THAN ONE START POINT DEFINED! CHECK THESE NODES: ');
      console.log(startNodes);
      this.snackBar.open('Zu viele Startpunkte in aktueller Route definiert. Bitte korrigieren.', 'OK');
      return;
    }
    else {
      // == 1
      this.currentRoute.startNode = startNodes[0];
    }

    let endNodes = this.currentRoute.nodes.filter((n) => {
      return n.end;
    });
    if (endNodes.length < 1) {
      console.log('NO END POINT DEFINED IN CURRENT ROUTE!');
      this.snackBar.open('Kein Endpunkt in aktueller Route definiert. Bitte korrigieren.', 'OK');
      return;
    }
    else if (endNodes.length > 1) {
      console.log('MORE THAN ONE END POINT DEFINED! CHECK THESE NODES: ');
      console.log(endNodes);
      this.snackBar.open('Zu viele Endpunkte in aktueller Route definiert. Bitte korrigieren.', 'OK');
      return;
    }
    else {
      // == 1
      this.currentRoute.endNode = endNodes[0];
    }

    // all is well
    console.log('Saved route:');
    console.log(this.currentRoute);
    this.currentRoute = new Route();
    //@ts-ignore
    this.currentRoute.color = this.colors(this.currentRoute.routeID);
    this.routes.push(this.currentRoute);
    console.log('New route ID: ' + this.currentRoute.routeID);
  }

  keyDown() {
    let module = this;

    if (this.lastKeyDown !== -1) return;
    this.lastKeyDown = d3.event.keyCode;

    // entf oder backspace
    if (this.lastKeyDown === 8 || this.lastKeyDown === 46) {
      if (this.selectedNode !== null) {
        if (!this.svgActive) return;
        // remove edges with node
        let edgesToRemove = this.edges.filter((e) => {
          return (e.startNode === this.selectedNode.nodeID || e.endNode === this.selectedNode.nodeID);
        });
        for (let edge of edgesToRemove) {
          this.edges.splice(this.edges.indexOf(edge), 1);
        }


        // remove node
        this.nodes.splice(this.nodes.indexOf(this.selectedNode), 1);
        // remove node from currentroute to fix the Edge-To-Disappearing-Node Bug
        if (this.selectedNode.routeID === this.currentRoute.routeID) {
          this.currentRoute.nodes.splice(this.currentRoute.nodes.indexOf(this.selectedNode), 1);
        }
        this.selectedNode = null;
        this.drawCircles();
        this.drawEdges();
      }
    }
  }

  keyUp() {
    this.lastKeyDown = -1;

    let key = d3.event.keyCode;

  }

  onMQTTConnect() {
    // Subscribe
    console.log('MQTT connected');
    this.mqtt.subscribe('hello');
    this.mqttConnected = true;
    this.snackBar.open('MQTT verbunden!', null, {duration: 2000});

    this.initFTF();
  }

  onMQTTError(error) {
    this.mqttConnected = this.mqtt.isConnected();
    console.log('MQTT ERROR:');
    console.log(error);
    this.snackBar.open('MQTT Fehler: ' + error.errorMessage, null, {duration: 2000});
  }

  onMQTTConnectionLost(info) {
    console.log('MQTT CONNECTION LOST!');
    console.log(info);
    this.mqttConnected = false;
    this.snackBar.open('MQTT getrennt!', null, {duration: 2000});
  }

  onMQTTMessage(message) {
    if (message.destinationName == 'hello') {
      this.snackBar.open('MQTT Message: ' + message.payloadString, null, {duration: 2000});
    }
    else {
      try {
        this.updateFTFs(message);
      }
      catch (error) {
        console.log(error)
      }
    }
  }

  onMQTTDisconnect() {
    console.log('MQTT Disconnected.');
    this.mqttConnected = false;
    this.snackBar.open('MQTT getrennt!', 'OK',{duration: 2000});
  }

  toggleSettings() {
    let component = this;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "400px";
    dialogConfig.data = {
      mapChanged: false,
      mapMetersPerPixel: this.mapMetersPerPixel,
      mapXoffset: this.mapXoffset,
      mapYoffset: this.mapYoffset,
      mqttChanged: false,
      mqttHost: this.mqttHost,
      mqttPort: this.mqttPort,
      mqttClientID: this.mqttClientID
    };

    const settingsDialogRef = this.settingsDialog.open(SettingsFormComponent, dialogConfig);

    settingsDialogRef.afterClosed().subscribe(result => {
      if (result){
        console.log('saved');
        this.mapMetersPerPixel = result.mapMetersPerPixel;
        this.mapXoffset = result.mapXoffset;
        this.mapYoffset = result.mapYoffset;

        if (result.customMap) {
          let stage = document.getElementById('stage');
          let image = new Image();
          image.src = result.customMap;
          image.onload = function () {
            stage.setAttribute('style', "background-image: url('" + result.customMap + "')");
            localStorage.setItem('customMap', result.customMap);
            component.mapWidthInPixels = image.width;
            component.mapHeightInPixels = image.height;
            component.calculateMapDisplaySettings();
            component.setStageSizeToDisplaySettings();
            component.initScales();
          }
        }
        this.mqttHost = result.mqttHost;
        this.mqttPort = Number(result.mqttPort);
        this.mqttClientID = result.mqttClientID;

        if (result.mqttChanged) {
          this.saveMQTTSettings();
          this.initMQTT();
        }

        if (result.mapChanged) {
          // evtl. berichtigung der Längen und Breitenangaben
          this.initScales();
          this.updateCoordinateSystem();
          localStorage.setItem('mapMetersPerPixel', result.mapMetersPerPixel.toString());
        }
      }
      else {
        console.log('not saved');
      }
    });
  }

  toggleMQTT() {
    if (this.mqttConnected) {
      this.mqtt.disconnect();
      this.mqttManuallyDisconnected = true;
    }
    else {
      this.initMQTT();
    }
  }

  initFTF() {
    if (!this.loadFTFs()) {
      let ftf = new FTF();
      ftf.manufacturer = 'KIT';
      ftf.fleet = 'KARIS';
      ftf.name = '0001';
      ftf.x = 0;
      ftf.y = 0;
      ftf.theta = 0;
      ftf.batteryStatus = 0.1;

      this.mqtt.subscribe(ftf.getBaseTopic() + '/#');

      this.ftfs.push(ftf);
    }
  }

  drawFTFs() {
    const ftfSymbolGroup = this.ftfGroup.selectAll('g').data(this.ftfs, (d) => d.id);
    let module = this;

    ftfSymbolGroup
      .attr('transform', (d) => {
        return 'translate(' + this.xScale(d.x) + ',' + this.yScale(d.y) + ')';
      });



    ftfSymbolGroup
      .select('use.ftfBodyClass')
      .attr('transform',(d) => {

        return 'rotate(' + (-d.theta * (180.0 / Math.PI)) + ')';});

    ftfSymbolGroup
      .select('use.powerClass')
      .attr('transform', (d) => {

        return 'translate(' + -15.0 * (1-d.batteryStatus) + ',0) scale(' + d.batteryStatus + ',1)';
      });


    const initFtfSymbol = ftfSymbolGroup.enter()
      .append('svg:g')
      .attr('id', (d) => {return 'FTF' + d.id;})
      .attr('transform', (d) => {

        return 'translate(' + this.xScale(d.x) + ',' + this.yScale(d.y) + ')';
      })
      .on('mouseup', (d) => {
        d3.event.stopPropagation();
        if (this.lastKeyDown === 17) {
          // Control key held!
          module.addNodeOnFTFPosition(d);
          return;
        }
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = d;

        const ftfDialogRef = this.ftfDialog.open(FtfFormComponent, dialogConfig);
        ftfDialogRef.afterClosed().subscribe(result => {
          if (result) {
            Object.assign(d, result);
          }
        });
      });

    initFtfSymbol
      .append('svg:use')
      .attr('xlink:href',"#ftfBody")
      .attr('class', 'ftfBodyClass')
      //.attr('id', 'ftfBody')
      .attr('transform',(d) => {

        return 'rotate(' + -d.theta * (180.0 / Math.PI) + ')';});

    initFtfSymbol
      .append('svg:use')
      .attr('class', 'powerBarClass')
      .attr('xlink:href',"#powerBar")
      .attr('x',0)
      .attr('y',18);

    initFtfSymbol
      .append('svg:use')
      .attr('xlink:href',"#power")
      .attr('class', 'powerClass')
      //.attr('id', 'power')
      .attr('x',0)
      .attr('y',18)
      .attr('transform', (d) => {

        return 'translate(' + -15.0 * (1-d.batteryStatus) + ',0) scale(' + d.batteryStatus + ',1)';
      });

    ftfSymbolGroup
      .exit()
      .remove();
  }

  updateFTFs(message) {
    try {
      let topic = message.destinationName.split('/');
      let name = topic[2];
      let subtopic = topic[3];
      let ftfToUpdate = this.ftfs.find(ftf => { return ftf.name == name;});
      ftfToUpdate.addMessage(message);
      ftfToUpdate.updateByMQTT(message);
      this.drawFTFs();
    }
    catch (error) {
      this.snackBar.open('Kaputtes JSON als Navimessage erhalten. Kein Positionsupdate möglich.', undefined, {duration: 2000});
      console.log(error);
      console.log(message);
    }

  }

  addFTF() {
    let newFTF = new FTF();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = newFTF;

    const ftfDialogRef = this.ftfDialog.open(FtfFormComponent, dialogConfig);
    ftfDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ftfs.push(result);
        this.mqtt.subscribe(result.getBaseTopic() + '/#');
        console.log(result);
      }
    });
  }

  toggleRouteForm() {
    if (this.routeFormVisible) {
      this.routeFormVisible = false;
    }
    else {
      this.routeFormVisible = true;
      this.ftfListVisible = false;
    }
  }

  toggleFtfList() {
    if (this.ftfListVisible) {
      this.ftfListVisible = false;
    }
    else {
      this.ftfListVisible = true;
      this.routeFormVisible = false;
    }
  }

  loadFTFs() {
    let ftfJson = localStorage.getItem('list_of_ftfs');
    if (ftfJson != null) {
      let ftfArray = JSON.parse(ftfJson);
      for (let ftfToRestore of ftfArray) {
        let ftf = new FTF();
        ftf.manufacturer = ftfToRestore.manufacturer;
        ftf.fleet = ftfToRestore.fleet;
        ftf.name = ftfToRestore.name;
        this.ftfs.push(ftf);
        this.mqtt.subscribe(ftf.getBaseTopic() + '/#');
      }
      return true;
    }
    else {
      return false;
    }
  }

  addNodeOnFTFPosition(ftf: FTF) {
    const node = new Node();
    node.position.x = ftf.x;
    node.position.y = ftf.y;
    node.position.theta = ftf.theta;
    node.routeID = this.currentRoute.routeID;

    // check if route already has a start
    if (this.currentRoute.nodes.length == 0) {
      node.start = true;
      this.currentRoute.startNode = node;
    }
    else if (this.currentRoute.nodes.length == 1) {
      node.end = true;
      this.currentRoute.endNode = node;
    }
    else {
      node.end = true;
      this.currentRoute.nodes[this.currentRoute.nodes.length - 1].end = false;
      this.currentRoute.endNode = node;
    }

    this.nodes.push(node);
    this.currentRoute.nodes.push(node);

    // automatically add edge between nodes, but only if they are on the same route!
    if (this.currentRoute.nodes.length > 1) {
      this.addEdge(
        this.currentRoute.nodes[this.currentRoute.nodes.length - 2],
        this.currentRoute.nodes[this.currentRoute.nodes.length - 1]
      );
    }

    this.drawCircles();
    this.drawEdges();
  }

  drawCoordinateSystem() {
    this.stage.append('g')
      .attr('id', 'coordinateSystem')
      .attr('transform', 'translate(' + this.xScale(0) + ',' + this.yScale(0) + ')')
      .append('svg:use')
      .attr('xlink:href', '#coordSys')
      //.attr('transform', 'scale(0.3)')

  }

  updateCoordinateSystem() {
    this.stage.selectAll('#coordinateSystem')
      .attr('transform', 'translate(' + this.xScale(0) + ',' + this.yScale(0) + ')')
  }

}
