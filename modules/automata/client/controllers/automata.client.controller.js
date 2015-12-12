'use strict';

// Automata controller

angular.module('automata').controller('AutomataController', ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Automata', 'automatonGraph',
  function ($scope, $state, $stateParams, $location, Authentication, Automata, automatonGraph) {
    $scope.authentication = Authentication;

    // Create new Automaton in the database
    $scope.create = function (isValid) {
      //var automaton;
      $scope.error = null;

      if (!isValid) {
        console.log('not valid');
        $scope.$broadcast('show-errors-check-validity', 'automatonForm');

        return false;
      }

      // Redirect after save
      var automaton = $scope.automaton;
      automaton.$save(function (response) {
        console.log('saved');
        $location.path('automata/' + response._id);

        // Clear form fields
        $scope.title = '';
      //  $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Automaton
    $scope.remove = function (automaton) {
      if (automaton) {
        automaton.$remove();

        for (var i in $scope.automata) {
          if ($scope.automata[i] === automaton) {
            $scope.automata.splice(i, 1);
          }
        }
      } else {
        $scope.automaton.$remove(function () {
          $location.path('automata');
        });
      }
    };

    // Update existing Automaton
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'automatonForm');

        return false;
      }

      var automaton= $scope.automaton;

      automaton.$update(function () {
        $location.path('automata/' + automaton._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Automata
    $scope.find = function () {
      $scope.automata = Automata.query();
    };

    // Find existing Automata
    $scope.findOne = function () {
      $scope.automaton = Automata.get({
        automatonId: $stateParams.automatonId
      },function(){
        setUpGraph();
      });
    };

    if($state.current.data && $state.current.data.type){
      // Create new Automaton object
      $scope.automaton = new Automata({
        title: 'untitled automaton',
        machine: $state.current.data.type,
        eles: {
          nodes: [
            { data: { id: 'start' }, classes: 'startmarker' },
            { data: { id: '0', start: true }, position: { x: 0, y: 0 } }],
          edges: []
        }
      });
      setUpGraph();
    }

    function setUpGraph(){
      /* CYTOSCAPE */
      var cy; //ref to cy
      automatonGraph($scope.automaton.eles).then(function(automatonCy){
        cy = automatonCy;
        $scope.cyLoaded = true;
      });
    }
  }
]);
