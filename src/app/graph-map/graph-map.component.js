"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var d3 = require("d3");
var Node_1 = require("./Node");
var Edge_1 = require("./Edge");
var Route_1 = require("./Route");
var GraphMapComponent = /** @class */ (function () {
    function GraphMapComponent() {
        // Stuff um routen, nodes und edges zu verwalten
        this.nodes = [];
        this.routes = [];
        this.currentRoute = new Route_1.Route('demo');
        //nodes: Node[] = [{id: 0, name: '1', x: 0, y: 0, start: false, end: false, selected: false, edges: [], route: this.currentRoute},
        //  {id: 1, name: '2', x: -13, y: 16.5,start: false, end: false, selected: false, edges: [], route: this.currentRoute}];
        this.nextNodeID = 0;
        this.edges = [];
        this.nextEdgeID = 0;
        // Stuff für Maus-Events
        this.buttonDownNode = null;
        this.buttonUpNode = null;
        this.selectedNode = null;
        this.svgActive = false;
        // Tastaturevents
        this.lastKeyDown = -1;
        this.colors = d3.scaleOrdinal(d3.schemeCategory10);
        this.stage_width = 537;
        this.stage_height = 670;
        this.xScale = d3.scaleLinear()
            .domain([-13.425, 13.425])
            .range([0, this.stage_width]);
        this.yScale = d3.scaleLinear()
            .domain([-16.75, 16.75])
            .range([0, this.stage_height]);
    }
    GraphMapComponent.prototype.ngOnInit = function () {
        var _this = this;
        // Hier die App starten!
        this.initSvg();
        this.drawCircles();
        this.stage.on('mouseup', this.addNodes.bind(this));
        d3.select(window)
            .on('keydown', this.keyDown.bind(this))
            .on('keyup', this.keyUp.bind(this))
            .on('mousedown', function (ev) {
            _this.svgActive = false;
        });
    };
    GraphMapComponent.prototype.initSvg = function () {
        this.stage = d3.select('#stage');
        this.circleGroup = this.stage.append('svg:g');
        this.edgeGroup = this.stage.append('svg:g').selectAll('path');
        this.dragLineGroup = this.stage.append('g')
            .attr('id', 'dragline');
    };
    GraphMapComponent.prototype.drawCircles = function () {
        var _this = this;
        var module = this;
        var circle = this.circleGroup.selectAll('g').data(this.nodes, function (d) { return d.id; });
        // update existing circles
        circle
            .selectAll('circle')
            .style('fill', function (d) { return (d === _this.selectedNode) ? d3.rgb(_this.colors(d.route.id)).brighter().toString() : _this.colors(d.route.id); });
        // delete old circles
        circle
            .exit().remove();
        // update position
        circle.attr('transform', function (d) {
            return "translate(" + module.xScale(d.x) + "," + module.yScale(d.y) + ")";
        });
        var g = circle.enter().append('svg:g');
        g.append('circle')
            .attr('r', 12)
            .style('fill', function (d) { return (d === _this.selectedNode) ? d3.rgb(_this.colors(d.route.id)).brighter().toString() : _this.colors(d.route.id); })
            .style('stroke', function (d) { return d3.rgb(_this.colors(d.route.id)).darker().toString(); });
        g.append('svg:text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'id')
            .style('font', '12px sans-serif')
            .style('pointer-events', 'none')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(function (d) { return d.name; });
        g.attr('transform', function (d) {
            return "translate(" + module.xScale(d.x) + "," + module.yScale(d.y) + ")";
        })
            .on('mousedown', function (d) {
            _this.svgActive = true;
            console.log('circle mousedown');
            _this.buttonDownNode = d;
            console.log('Button down:' + _this.buttonDownNode.id);
        })
            .on('mouseup', function (d) {
            _this.svgActive = true;
            console.log('circle mouseup');
            d3.event.stopPropagation();
            _this.buttonUpNode = d;
            console.log('Button up:' + _this.buttonUpNode.id);
            console.log(_this.buttonUpNode.id);
            console.log(_this.buttonDownNode.id);
            if (_this.buttonDownNode === _this.buttonUpNode) {
                _this.selectedNode = d;
                console.log('Selected node ' + d.id);
                console.log(_this.selectedNode);
            }
            _this.buttonUpNode = null;
            _this.buttonDownNode = null;
        });
    };
    GraphMapComponent.prototype.addNodes = function () {
        //@ts-ignore
        this.svgActive = true;
        console.log('svg mouseup');
        if (this.selectedNode !== null) {
            this.selectedNode = null;
            return;
        }
        var coords = d3.mouse(document.getElementById('stage'));
        var node = new Node_1.Node();
        node.x = this.xScale.invert(coords[0]);
        node.y = this.yScale.invert(coords[1]);
        node.route = this.currentRoute;
        this.nodes.push(node);
        this.drawCircles();
        console.log(this.nodes);
    };
    GraphMapComponent.prototype.reconfigureNode = function (name, nodeType) {
        console.log(name + ',' + nodeType);
        console.log(this.selectedNode);
        if (this.selectedNode === null)
            return;
        this.selectedNode.name = name;
        if (nodeType === 'start') {
            this.selectedNode.start = true;
            this.selectedNode.end = false;
        }
        else if (nodeType === 'end') {
            this.selectedNode.start = false;
            this.selectedNode.end = true;
        }
        else if (nodeType === 'none') {
            this.selectedNode.start = false;
            this.selectedNode.end = false;
        }
        console.log(this.selectedNode);
        this.drawCircles();
    };
    GraphMapComponent.prototype.dragFunc = function (d) {
        d.x = this.xScale.invert(d3.event.x);
        d.y = this.yScale.invert(d3.event.y);
        this.drawCircles();
        //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    };
    GraphMapComponent.prototype.addEdge = function (source, target) {
        if (source === target)
            return;
        if (source === null || target === null)
            return;
        var edge = new Edge_1.Edge();
        edge.source = source;
        edge.target = target;
        this.edges.push(edge);
    };
    GraphMapComponent.prototype.addRoute = function () {
        /*
        this.routes.push(this.currentRoute);
        this.currentRoute = new Route();
        console.log(this.currentRoute.id);
        */
        this.nodes = [];
        this.drawCircles();
    };
    GraphMapComponent.prototype.keyDown = function () {
        var module = this;
        //d3.event.preventDefault();
        console.log(this.svgActive);
        if (this.lastKeyDown !== -1)
            return;
        this.lastKeyDown = d3.event.keyCode;
        // ctrl
        if (this.lastKeyDown === 17) {
            this.circleGroup.selectAll('g')
                .call(d3.drag()
                .subject(function (d) {
                // @ts-ignore
                return { x: module.xScale(d.x), y: module.yScale(d.y) };
            })
                .on("drag", this.dragFunc.bind(this)));
        }
        // entf oder backspace
        if (this.lastKeyDown === 8 || this.lastKeyDown === 46) {
            if (this.selectedNode !== null) {
                if (!this.svgActive)
                    return;
                // remove node
                this.nodes.splice(this.nodes.indexOf(this.selectedNode), 1);
                this.selectedNode = null;
                this.drawCircles();
            }
        }
    };
    GraphMapComponent.prototype.keyUp = function () {
        this.lastKeyDown = -1;
        console.log(d3.event.keyCode);
        var key = d3.event.keyCode;
        // ctrl
        if (key === 17) {
            this.circleGroup.selectAll('g')
                .on('.drag', null);
        }
    };
    GraphMapComponent = __decorate([
        core_1.Component({
            selector: 'app-graph-map',
            templateUrl: './graph-map.component.html',
            styleUrls: ['./graph-map.component.css']
        })
    ], GraphMapComponent);
    return GraphMapComponent;
}());
exports.GraphMapComponent = GraphMapComponent;
//# sourceMappingURL=graph-map.component.js.map