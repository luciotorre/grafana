define([
  'angular',
  'app/app',
  'lodash',
  'require',
  'app/components/panelmeta',
],
function (angular, app, _, require, PanelMeta) {
  'use strict';

  var viewer;

  var module = angular.module('grafana.panels.globe', []);
  app.useModule(module);

  module.directive('grafanaPanelGlobe', function() {
    return {
      controller: 'GlobePanelCtrl',
      templateUrl: 'app/panels/globe/module.html',
    };
  });

  module.controller('GlobePanelCtrl', function($scope, $http, templateSrv, $sce, panelSrv, panelHelper) {
    $scope.panelMeta = new PanelMeta({
      panelName: 'Globe',
      editIcon:  "fa fa-text-width",
      fullscreen: true,
    });

    $scope.panelMeta.addEditorTab('Edit Globe', 'app/panels/globe/editor.html');

    // Set and populate defaults
    var _d = {
      title   : 'default title',
      mode    : "markdown", // 'html', 'markdown', 'text'
      content : "",
      style: {},
    };

    _.defaults($scope.panel, _d);

    $scope.init = function() {
      panelSrv.init($scope);
      $scope.ready = false;
      $scope.created = false;
    };

    $scope.refreshData = function() {
      delete $scope.panelMeta.error;
      panelHelper.updateTimeRange($scope);

      $scope.render();
      if ($scope.panel.url) {
        var source = $scope.panel.url + "?from=" + $scope.range.from.unix() + "&to=" + $scope.range.to.unix();
        viewer.dataSources.removeAll(true);
        return viewer.dataSources.add(Cesium.CzmlDataSource.load(source)).then(function(result) {
        }, function(err) {
          $scope.panelMeta.error = "Could not get data: " + err;
        });
      }
    };

    $scope.render = function() {
      if (!$scope.created) {
        viewer = new Cesium.Viewer('cesiumContainer', {
            // Use high-res stars downloaded from https://github.com/AnalyticalGraphicsInc/cesium-assets
          skyBox : new Cesium.SkyBox({
            sources : {
              positiveX : 'img/stars/tycho2t3_80_px.jpg',
              negativeX : 'img/stars/tycho2t3_80_mx.jpg',
              positiveY : 'img/stars/tycho2t3_80_py.jpg',
              negativeY : 'img/stars/tycho2t3_80_my.jpg',
              positiveZ : 'img/stars/tycho2t3_80_pz.jpg',
              negativeZ : 'img/stars/tycho2t3_80_mz.jpg'
            }
          })
        });
        viewer.bottomContainer.childNodes[0].innerHTML = '';
        viewer.scene.globe.enableLighting = true;
        viewer.cesiumWidget.canvas.style.height = '400px';
        $scope.created = true;
      }
      panelHelper.updateTimeRange($scope);
    };

    $scope.init();
  });
});
