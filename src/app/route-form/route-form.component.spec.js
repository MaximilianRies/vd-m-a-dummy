"use strict";
exports.__esModule = true;
var testing_1 = require("@angular/core/testing");
var route_form_component_1 = require("./route-form.component");
describe('RouteFormComponent', function () {
    var component;
    var fixture;
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [route_form_component_1.RouteFormComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = testing_1.TestBed.createComponent(route_form_component_1.RouteFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=route-form.component.spec.js.map
