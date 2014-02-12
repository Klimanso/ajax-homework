/* global AppController */
function AppViewModel(){
    'use strict';

    this.fullInformation = ko.observable(AppController);
};

ko.applyBindings(new AppViewModel());