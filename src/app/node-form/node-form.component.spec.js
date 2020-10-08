"use strict";
exports.__esModule = true;
var testing_1 = require("@angular/core/testing");
var node_form_component_1 = require("./node-form.component");
describe('NodeFormComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [node_form_component_1.NodeFormComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(node_form_component_1.NodeFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=node-form.component.spec.js.map