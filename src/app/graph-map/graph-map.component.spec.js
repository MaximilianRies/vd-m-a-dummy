"use strict";
exports.__esModule = true;
var testing_1 = require("@angular/core/testing");
var graph_map_component_1 = require("./graph-map.component");
describe('GraphMapComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [graph_map_component_1.GraphMapComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(graph_map_component_1.GraphMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=graph-map.component.spec.js.map