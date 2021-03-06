(function (window) {
  'use strict';

  var applicationModuleName = 'mean';

  var service = {
    applicationEnvironment: window.env,
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ngImgCrop'],
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;

  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));

(function (app) {
  'use strict';

  // Start by defining the main module and adding the module dependencies
  angular
    .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular
    .module(app.applicationModuleName)
    .config(bootstrapConfig);

  function bootstrapConfig($compileProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');

    // Disable debug data for production environment
    // @link https://docs.angularjs.org/guide/production
    // $compileProvider.debugInfoEnabled(app.applicationEnvironment !== 'production');
    // Unfortunately, debug data must be enabled in order to access the scope of a
    // DOM element, which is necessary to open the modal window from cytoscape
    // edgehandles. Until a better solution exists, we have to leave debug info enabled.
    // https://github.com/angular/angular.js/issues/9515
    $compileProvider.debugInfoEnabled(true);
  }

  bootstrapConfig.$inject = ['$compileProvider', '$locationProvider', '$httpProvider'];

  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }

    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('automata', ['core', 'windows', 'ui.bootstrap', 'xeditable']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('automata.services');
  app.registerModule('automata.routes', ['ui.router', 'core.routes', 'automata.services']);

}(ApplicationConfiguration));

(function (app) {
  'use strict';

  // Use Applicaion configuration module to register a new module
  app.registerModule('itsADrag');
  app.registerModule('resizeIt');
  app.registerModule('windows', ['itsADrag', 'resizeIt']);

}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('core');
  app.registerModule('core.routes', ['ui.router']);
  app.registerModule('core.admin', ['core']);
  app.registerModule('core.admin.routes', ['ui.router']);
}(ApplicationConfiguration));

(function (app) {
  'use strict';

  app.registerModule('users');
  app.registerModule('users.admin');
  app.registerModule('users.admin.routes', ['ui.router', 'core.routes', 'users.admin.services']);
  app.registerModule('users.admin.services');
  app.registerModule('users.routes', ['ui.router', 'core.routes']);
  app.registerModule('users.services');
}(ApplicationConfiguration));

(function () {
  'use strict';

  angular
    .module('automata')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Create',
      state: 'automata',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    /*
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'List Automata',
      state: 'automata.list'
    });
    */

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Turing Machine',
      state: 'automata.create-tm',
      roles: ['*']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Finite State Automaton',
      state: 'automata.create-fsa',
      roles: ['*']
    });
    menuService.addSubMenuItem('topbar', 'automata', {
      title: 'New Pushdown Automaton',
      state: 'automata.create-pda',
      roles: ['*']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('automata.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('automata', {
        abstract: true,
        url: '/automata',
        template: '<ui-view/>'
      })
      .state('automata.list', {
        url: '',
        templateUrl: 'modules/automata/client/views/list-automata.client.view.html',
        controller: 'AutomataListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Automata List'
        }
      })
      .state('automata.create-tm', {
        url: '/create-tm',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newTM
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'tm',
          pageTitle: 'Create TM'
        }
      })
      .state('automata.create-fsa', {
        url: '/create-fsa',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newFSA
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'fsa',
          pageTitle: 'Create FSA'
        }
      })
      .state('automata.create-pda', {
        url: '/create-pda',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: newPDA
        },
        data: {
//          roles: ['user', 'admin'],
          type: 'pda',
          pageTitle: 'Create PDA'
        }
      })
      .state('automata.view', {
        url: '/:automatonId',
        templateUrl: 'modules/automata/client/views/view-automaton.client.view.html',
        controller: 'AutomataController',
        controllerAs: 'vm',
        resolve: {
          automatonResolve: getAutomaton
        },
        data: {
//          roles: ['user', 'admin'],
          pageTitle: 'View Automaton'
        }
      });
  }

  getAutomaton.$inject = ['$stateParams', 'AutomataService'];

  function getAutomaton($stateParams, AutomataService) {
    return AutomataService.get({
      automatonId: $stateParams.automatonId
    }).$promise;
  }

  newFSA.$inject = ['$state', 'AutomataService'];
  function newFSA($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'fsa');
  }
  newPDA.$inject = ['$state', 'AutomataService'];
  function newPDA($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'pda');
  }
  newTM.$inject = ['$state', 'AutomataService'];
  function newTM($state, AutomataService) {
    return newAutomaton($state, AutomataService, 'tm');
  }
  // newAutomaton.$inject = ['$state', 'AutomataService'];

  function newAutomaton($state, AutomataService, machine) {
    // return new AutomataService();

    var empty_stack = [];
    // console.log($routeParams);

    var empty_tape = [];
    for (var i = 0; i < 50; i++) {
      empty_tape.push(' ');
    }
    return new AutomataService({
      alphabet: ['0', '1', 'A', 'B', 'C', '_'],
      eles: {
        nodes: [
          { data: { id: 'start' }, classes: 'startmarker' },
          { data: { id: '0',
                    label: '0',
                    start: true },
                    classes: 'enode nnode',
                    position: { x: 0, y: 0 } }],
        edges: []
      },
      tape: {
        position: 0,
        contents: empty_tape
      },
      stack: empty_stack,
      determ: true
    });
  }
}());

'use strict';

angular.module('automata').controller('AddEdgeModalController', ['$scope', '$uibModal', '$log',
function ($scope, $uibModal, $log) {
  $scope.open = function (size, addedEntities) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'addEdgeModalContent.html',
      controller: 'AddEdgeModalInstanceCtrl',
      backdrop: 'static',
      size: size,
      resolve: {
        machine: function () {
          return $scope.$parent.vm.automaton.machine;
        },
        alphabet: function () {
          return $scope.$parent.vm.automaton.alphabet;
        },
        addedEntities: function () {
          return addedEntities;
        },
        determ: function () {
          return $scope.$parent.vm.automaton.determ;
        }
      }
    });
    modalInstance.result.then(function () {

    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('automata').controller('AddEdgeModalInstanceCtrl',
['$scope', '$uibModalInstance', 'machine', 'determ', 'addedEntities', 'alphabet',
function ($scope, $uibModalInstance, machine, determ, addedEntities, alphabet) {
  $scope.alphabet = alphabet;
  $scope.read_alph = $scope.alphabet.slice();
  $scope.read_stack_alph = alphabet.concat(['-']);
  $scope.stack_act_alph = alphabet.concat(['^']);
  $scope.machine = machine;
  $scope.addedEntities = addedEntities;
  $scope.act_alph = alphabet.concat(['<', '>']);

  if (determ) { // ensures only available out symbols
    if (machine !== 'pda') {
      var fromNode = $scope.addedEntities.source();
      fromNode.outgoers().forEach(function(el) {
        if (el.isEdge() && el.data().read) {
          for (var i = 0; i < $scope.read_alph.length; i++) {
            if (el.data().read === $scope.read_alph[i]) {
              $scope.read_alph.splice(i, 1);
            }
          }
        }
      });
    } else {
      // TODO: deal with deterministic selections for
      // the PDA case
    }
  }
  $scope.ok = function () {
    var read = $scope.labels.read;
    var act;
    addedEntities.data('read', read);
    if (machine === 'tm') {
      act = $scope.labels.act;
      addedEntities.data('action', act);
      addedEntities.data('label', read + ':' + act);
    } else if (machine === 'pda') {
      var read_stack = $scope.labels.read_stack;
      act = $scope.labels.act;
      addedEntities.data('read_stack', read_stack);
      addedEntities.data('action', act);
      addedEntities.data('label', read + ':' + read_stack + ':' + act);
    } else {
      addedEntities.data('label', read);
    }
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
    $scope.addedEntities.remove();
  };

}]);

(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataController', AutomataController);

  AutomataController.$inject =
            ['$scope', '$state', '$window',
            '$timeout', '$location', '$stateParams',
            'Authentication', 'automatonResolve',
            'automatonGraph', 'tape'];

  function AutomataController($scope, $state, $window,
          $timeout, $location, $stateParams,
          Authentication, automaton,
          automatonGraph, tape) {
    var vm = this;
    vm.automaton = automaton;
    vm.authentication = Authentication;
    vm.error = null;
    // vm.remove = remove;
    vm.save = save;

    vm.automaton.machine = vm.automaton.machine || $state.current.data.type;
    vm.automaton.title = vm.automaton.title || (function() {
      if ($state.current.data.type === 'fsa') return 'Untitled Finite-State Automaton';
      else if ($state.current.data.type === 'pda') return 'Untitled Pushdown Automaton';
      else return 'Untitled Turing Machine';
    }());

    var cy; // ref to cy
    var pauses = {
      'default': 500,
      'fast': 1
    };

    var stopPlay = true;

    vm.play = function (speed) {
      vm.playAutomaton(cy, vm.automaton, speed);
    };

    function resetStack() {
      if (vm.automaton.machine === 'pda') {
        vm.automaton.stack = [];
        for (var j = 0; j < 20; j++) {
          vm.automaton.stack.push(' ');
        }
      }
    }

    vm.playAutomaton = function(cy, automaton, speed) {
      if (stopPlay) {
        vm.reset(cy, automaton);
        stopPlay = false;
        resetStack();
        cy.$('node').addClass('running');
        cy.$('edge').addClass('running');
        var startNode = cy.getElementById('0');
        startNode.addClass('active');
        var pause = pauses[speed];
        if (vm.automaton.machine === 'fsa') {
          vm.doNextStepFSA(startNode, 0, cy, null, pause, tape);
        } else if (vm.automaton.machine === 'pda') {
          vm.doNextStepPDA(startNode, 0, cy, null, pause, tape);
        } else if (vm.automaton.machine === 'tm') {
          vm.doNextStepTM(startNode, 0, cy, null, pause, tape);
        }
      }
    };

    vm.labels = { read: '', act: '' };

    // TODO: Remove existing Automaton
    /*
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.automaton.$remove($state.go('automata.list'));
      }
    }
    */

    vm.fileExport = function(isValid) {
      vm.resetElementColors();
      var image = document.createElement('img');

      image.addEventListener('load', function() {
        var doc = new jsPDF(); // eslint-disable-line

        doc.setFontSize(18);
        doc.text(25, 25, vm.automaton.title);

        doc.setFontSize(12);
        if (vm.automaton.demo) {
          doc.text(25, 33, 'Demo');
        } else if (vm.authentication.user) {
          doc.text(25, 33, vm.authentication.user.firstName + ' '
                          + vm.authentication.user.lastName);
        }

        doc.addImage(image.src, 'PNG', 15, 50, image.width / 10, image.height / 10);

        var filename = vm.automaton.title.replace(/\/|\\|\?|\%|\*|\:|\||\"|\<|\>|\.| /gi, '_');
        doc.save(filename + '.pdf');
      });
      image.src = cy.png({ full: true, maxWidth: 1800 });
    };


    // Save Automaton
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.automataForm');
        return false;
      }

      vm.automaton.eles.nodes = cy.nodes().jsons();
      vm.automaton.eles.edges = cy.edges().jsons();


      // TODO: move create/update logic to service

      if (vm.automaton._id) {
        vm.automaton.$update(successCallback, errorCallback);
      } else {
        vm.automaton.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.automaton._id = res._id;
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    vm.focusNext = tape.focusNext;
    // play is currently stopped. prevents play when
    // play is already in progress

    vm.resetElementColors = function() {
      resetStack();
      cy.$('node').removeClass('running');
      cy.$('edge').removeClass('running');
      cy.$('node').removeClass('active');
      cy.$('edge').removeClass('active');
      cy.$('node').removeClass('rejected');
      cy.$('node').removeClass('accepting');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
      // angular.element(document.querySelector('.node')).removeClass('rejected');
    };

    vm.setTapePosition = function(pos) {
      stopPlay = true;
      vm.automaton.tape.position = pos;
      vm.resetElementColors();
    };

    vm.reset = function(cy, automaton) {
      stopPlay = true;
      vm.automaton.tape.position = 0;
      vm.resetElementColors();
    };

    vm.doNextStepFSA = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        if ((!!vm.automaton.tape.contents[pos])
          && (vm.automaton.tape.contents[pos] !== ' ')
          && (vm.automaton.tape.contents[pos].length > 0)) {
          setTimeout(function() {
            var noOutgoing = true;
            node.outgoers().forEach(function(edge) {
              if (edge.data().read === vm.automaton.tape.contents[pos]) {
                noOutgoing = false;
                edge.addClass('active');
                var nextNode = edge.target();
                node.removeClass('active');
                nextNode.addClass('active');
                if (prevEdge && prevEdge !== edge) {
                  prevEdge.removeClass('active');
                }
                if (!stopPlay) {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                  vm.doNextStepFSA(nextNode, pos + 1, cy, edge, pause, t);
                } else {
                  vm.resetElementColors();
                }
              }
            });
            if (noOutgoing) {
              stopPlay = true;
              if (prevEdge) prevEdge.removeClass('active');
              cy.$('node').removeClass('running');
              cy.$('edge').removeClass('running');
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
            }
          }, pause);
        } else if (prevEdge) {
          setTimeout(function() {
            stopPlay = true;
            prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
            if (node.hasClass('accept')) {
              angular.element(document.querySelector('.tape-content')).addClass('accepted');
              node.removeClass('active');
              node.addClass('accepting');
            } else {
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
            }
          }, pause);
        }
      }
    };

    vm.doNextStepPDA = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        if ((!!vm.automaton.tape.contents[pos])
          && (vm.automaton.tape.contents[pos] !== ' ')
          && (vm.automaton.tape.contents[pos].length > 0)) { // if we're reading a character
          setTimeout(function() {
            var action = null;
            var read = null;
            var read_stack = null;
            var noOutgoing = true;
            node.outgoers().forEach(function(edge) {
              if (edge.data().read === '_') {
                read = ' ';
              } else {
                read = edge.data().read;
              }
              if (edge.data().read_stack === '_') {
                read_stack = ' ';
              } else {
                read_stack = edge.data().read_stack;
              }
              if (edge.data().action === '_') {
                action = ' ';
              } else {
                action = edge.data().read;
              }
              if (read === vm.automaton.tape.contents[pos]
                  && (read_stack === vm.automaton.stack[0] // read the stack
                      || read_stack === '-')) { // or ignore the stack
                noOutgoing = false;
                edge.addClass('active');
                var nextNode = edge.target();
                node.removeClass('active');
                nextNode.addClass('active');
                if (edge.data().action !== '-') { // '-' is no action on stack
                  if (edge.data().action === '^') {
                    vm.automaton.stack.shift();
                  } else {
                    console.log(action);
                    vm.automaton.stack.unshift(action);
                  }
                }
                if (prevEdge && prevEdge !== edge) {
                  prevEdge.removeClass('active');
                }
                if (!stopPlay) {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                  vm.doNextStepPDA(nextNode, pos + 1, cy, edge, pause, t);
                } else {
                  vm.resetElementColors();
                }
              }
            });
            if (noOutgoing) {
              stopPlay = true;
              if (prevEdge) prevEdge.removeClass('active');
              cy.$('node').removeClass('running');
              cy.$('edge').removeClass('running');
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
            }
          }, pause);
        } else if (prevEdge) {
          stopPlay = true;
          setTimeout(function() {
            prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
            if (node.hasClass('accept') && vm.automaton.stack[0] === ' ') {
              angular.element(document.querySelector('.tape-content')).addClass('accepted');
              node.removeClass('active');
              node.addClass('accepting');
            } else {
              angular.element(document.querySelector('.tape-content')).addClass('rejected');
              node.removeClass('active');
              node.addClass('rejected');
              if (vm.automaton.stack[0] !== ' ') {
                angular.element(document.querySelector('.stack-table')).addClass('rejected');
              }
            }
          }, pause);
        }
      } // if (!stopPlay) {
    };


    vm.doNextStepTM = function(node, pos, cy, prevEdge, pause, t) {
      if (!stopPlay) {
        $timeout(function() {
          var noOutgoing = true;
          var action = null;
          var read = null;
          node.outgoers().forEach(function(edge) {
            if (edge.data().read === '_') {
              read = ' ';
            } else {
              read = edge.data().read;
            }
            if (read === vm.automaton.tape.contents[pos] ||
                read === vm.automaton.tape.contents[pos] + ' ') {
              action = edge.data().action;
              noOutgoing = false;
              edge.addClass('active');
              var nextNode = edge.target();
              node.removeClass('active');
              nextNode.addClass('active');
              if (prevEdge && prevEdge !== edge) {
                prevEdge.removeClass('active');
              }
              if (!stopPlay) {
                if (action === '>') {
                  $scope.$apply(
                    t.movePosition(1, vm.automaton)
                  );
                } else if (action === '<') {
                  $scope.$apply(
                    t.movePosition((-1), vm.automaton)

                  );
                } else if (action === '_') {
                  $scope.$apply(
                    t.setContent(vm.automaton.tape.position, vm.automaton, ' ')
                  );
                } else if (action) {
                  $scope.$apply(
                    t.setContent(vm.automaton.tape.position, vm.automaton, edge.data().action)
                  );
                }
                action = null;
                read = null;
                vm.doNextStepTM(nextNode, vm.automaton.tape.position, cy, edge, pause, t);
              } else {
                vm.resetElementColors();
              }
              // break the foreach loop when a matching edge is found
              // otherwise read values will match newly written
              // tape values. "break" doesn't work for foreach
              return false;
            }
          });
          if (noOutgoing) {
            stopPlay = true;
            if (prevEdge) prevEdge.removeClass('active');
            cy.$('node').removeClass('running');
            cy.$('edge').removeClass('running');
          }
        }, pause);
      }
    };

    (function setUpGraph() {
      /* Set up Cytoscape graph */
      automatonGraph(vm.automaton.eles, vm.automaton.machine).then(function(automatonCy) {
        cy = automatonCy;

        vm.cyLoaded = true;

      });
    }());
  }
}());

(function () {
  'use strict';

  angular
    .module('automata')
    .controller('AutomataListController', AutomataListController);

  AutomataListController.$inject = ['AutomataService', 'DemoService', 'Authentication'];

  function AutomataListController(AutomataService, DemoService, Authentication) {
    var vm = this;
    vm.authentication = Authentication;
    vm.automata = AutomataService.query();
    vm.demos = DemoService.query();
  }
}());

'use strict';

/**
*
* Draggable Library
*
**/

angular.module('itsADrag', [])

/**
  Possible element attributes:
    1.  template
    2.  id
    3.  options - json of jquery ui draggable options
    4.  group
    5.  placeholder
**/
.directive('draggable', [function() {
  return {
    restrict: 'AE',
    link: function(scope, el, attrs) {
      scope.minimized = false;
      // draggable object properties
      scope.obj = {
        id: null,
        content: '',
        group: null
      };
      scope.placeholder = false;

      /** Setup **/

      scope.obj.content = el.html(); // store object's content

      if (angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      if (angular.isDefined(attrs.placeholder))
        scope.placeholder = scope.$eval(attrs.placeholder);

      // options for jQuery UI's draggable method
      var opts = (angular.isDefined(attrs.draggable)) ? scope.$eval(attrs.draggable) : {};

      if (angular.isDefined(attrs.group)) {
        scope.obj.group = attrs.group;
        opts.stack = '.' + attrs.group;
      }

      // event handlers
      var evts = {
        start: function(evt, ui) {
          if (scope.placeholder) // ui.helper is jQuery object
            ui.helper.wrap('<div class="dragging"></div>');

          scope.$apply(function() { // emit event in angular context
            scope.$emit('draggable.started', { obj: scope.obj });
          }); // end $apply
        }, // end start

        drag: function(evt) {
          scope.$apply(function() { // emit event in angular context
            scope.$emit('draggable.dragging');
          }); // end $apply
        }, // end drag

        stop: function(evt, ui) {
          if (scope.placeholder)
            ui.helper.unwrap();

          scope.$apply(function() { // emit event in angular context
            scope.$emit('draggable.stopped');
          }); // end $apply
        } // end stop
      }; // end evts

      // combine options and events
      var options = angular.extend({}, opts, evts);
      el.draggable(options); // make element draggable
    } // end link
  }; // end return
}]) // end draggable

.run(['$templateCache', function($templateCache) {
  $templateCache.put('/tmpls/draggable/default', '<div ng-transclude></div>');
}]); // end itsADrag.run

angular.module('resizeIt', [])
/**
  jQuery UI resizable adds exact pixel width and heights to the element via a style tag.
**/
.directive('resizeable', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, el, attrs, ctrlr) {
      scope.obj = {
        el: null,
        id: null,
        size: null // {width,height}
      };

      /** Setup **/

      scope.obj.el = el; // save handle to element

      if (angular.isDefined(attrs.id))
        scope.obj.id = attrs.id;

      var opts = (angular.isDefined(attrs.resizeable)) ? scope.$eval(attrs.resizeable) : {};

      var evts = {
        create: function(evt, ui) {
          $timeout(function() {
            scope.$emit('resizeable.create', { obj: scope.obj });
          });
        }, // end create

        start: function(evt, ui) {
          scope.$apply(function() {
            scope.$emit('resizeable.start', { obj: scope.obj });
          });
        }, // end start

        stop: function(evt, ui) {
          scope.$apply(function() {
            scope.$emit('resizeable.stop', { 'ui': ui });
            scope.obj.size = angular.copy(ui.size);
          });
        }, // end stop

        resize: function(evt, ui) {
          scope.$apply(function() {
            scope.$emit('resizeable.resizing');
          });
        } // end resize
      }; // end evts

      var options = angular.extend({}, opts, evts);
      el.resizable(options);

      /** Listeners **/

      scope.$on('resizeable.set.width', function(evt, params) {
        if (angular.isDefined(params.width))
          el.css('width', parseInt(params.width, 10) + 'px');
      }); // end on(resizeable.set.width

      scope.$on('resizeable.reset.width', function(evt) {
        if (angular.isDefined(scope.obj.size))
          el.css('width', scope.obj.size.width + 'px');
      }); // end on(resizeable.reset.width)
    } // end link
  }; // end return
}]); // end resizeable

angular.module('windows', ['ngAnimate', 'itsADrag', 'resizeIt'])
.directive('window', ['$animate', function($animate) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    templateUrl: 'modules/automata/client/partials/tape.html',
    scope: {
      id: '@id',
      title: '@title'
    },
    link: function(scope, el, attr) {
      scope.minimized = false;

      /** Methods **/
      scope.minimize = function() {
        scope.minimized = !scope.minimized;

        if (angular.equals(scope.minimized, true)) {
          $animate.addClass(el, 'minimize');
        } else {
          $animate.removeClass(el, 'minimize');
        }
      }; // end minimize

    } // end link
  }; // end return
}]) // end window

.directive('stackWindow', ['$animate', function($animate) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    templateUrl: 'modules/automata/client/partials/stack.html',
    scope: {
      id: '@id',
      title: '@title'
    },
    link: function(scope, el, attr) {
      scope.minimized = false;

      /** Methods **/
      scope.minimize = function() {
        scope.minimized = !scope.minimized;

        if (angular.equals(scope.minimized, true)) {
          $animate.addClass(el, 'minimize');
        } else {
          $animate.removeClass(el, 'minimize');
        }
      }; // end minimize

    } // end link
  }; // end return
}])

.run(['$templateCache', '$http', function($templateCache, $http) {
  $http.get('modules/automata/client/partials/tape.html', { cache: $templateCache });
  $http.get('modules/automata/client/partials/stack.html', { cache: $templateCache });
}]); // end windows

(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('AutomataService', AutomataService);

  AutomataService.$inject = ['$resource'];

  function AutomataService($resource) {
    return $resource('api/automata/:automatonId', {
      automatonId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());

/* global cytoscape */
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('automatonGraph', automatonGraph);

  automatonGraph.$inject = ['$q', 'AutomataService'];

  function automatonGraph($q, AutomataService) {

    /*  use a factory instead of a directive,
    *   because cy.js is not just for visualisation;
    *   you need access to the graph model and
    *   events etc
    */
    var cy;

    function resetElementColors() {
      cy.$('node').removeClass('running');
      cy.$('edge').removeClass('running');
      cy.$('node').removeClass('active');
      cy.$('edge').removeClass('active');
      cy.$('node').removeClass('rejected');
      cy.$('node').removeClass('accepting');
      angular.element(document.querySelector('.tape-content')).removeClass('accepted');
      angular.element(document.querySelector('.tape-content')).removeClass('rejected');
    }

    var automatonGraph = function(eles, machine) {
      var deferred = $q.defer();

      $(function() { // on dom ready
        cy = cytoscape({
          container: $('#cy')[0],
          boxSelectionEnabled: false,
          autounselectify: true,
          layout: {
            // name: 'cose',
            name: 'preset',
            // fit: true,
            // boundingBox: { x1:50, y1:0, x2:250, y2:300 },
            avoidOverlap: true // prevents node overlap, may overflow boundingBox if not enough space
            // avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
            // condense: true,
          },
          style: cytoscape.stylesheet()
            .selector('node')
              .css({
                'content': 'data(label)',
                'text-valign': 'center',
                'color': 'black',
                'background-color': 'white',
                'border-style': 'solid',
                'border-width': '2px'
              })
            .selector('node.submachine')
              .css({
                'content': 'data(label)',
                'text-valign': 'center',
                'color': 'black',
                'background-color': 'white',
                'border-style': 'solid',
                'border-width': '2px',
                'shape': 'rectangle'
              })
            .selector('.accept')
              .css({
                'border-style': 'double',
                'border-width': '6px'
              })
            .selector('.toDelete')
              .css({
                'overlay-color': 'red'
              })
            .selector('edge')
              .css({
                'width': 1,
                'label': 'data(label)',
                'edge-text-rotation': 'none',
                'curve-style': 'bezier',
                'control-point-step-size': '70px',
                'target-arrow-shape': 'triangle',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#555',
                'loop-direction': '-90deg',
                'loop-sweep': '1rad'
              })
            .selector('edge[direction]')
              .css({
                'loop-direction': 'data(direction)'
              })
            .selector('edge[sweep]')
              .css({
                'loop-sweep': 'data(sweep)'
              })
            .selector('.edgehandles-preview')
              .css({
                'loop-direction': '-90deg',
                'loop-sweep': '1rad'
              })
            .selector(':selected')
              .css({
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black'
              })
              .selector('.autorotate')
                .css({
                  'edge-text-rotation': 'autorotate'
                })
              .selector('.startparent')
                .css({
                  'border-width': '0',
                  'background-opacity': '0',
                  'content': ''
                })
              .selector('.startmarker')
                .css({
                  'border-style': 'solid',
                  'border-width': '2px',
                  'content': '',
                  'shape': 'polygon',
                  'shape-polygon-points': '1 0 0.5 -0.4 0.5 0.4'
                })
                .selector('node.running')
                  .css({
                    'color': 'Gray',
                    'background-color': 'lightGray',
                    'border-color': 'Gray'
                  })
                .selector('node.running.active')
                  .css({
                    'color': 'black',
                    'background-color': 'white',
                    'border-color': 'black'
                  })
                .selector('node.rejected')
                  .css({
                    'border-color': 'red'
                  })
                .selector('node.accepting')
                  .css({
                    'border-color': 'LimeGreen'
                  })
                .selector('edge.running')
                  .css({
                    'line-color': 'Gray',
                    'target-arrow-color': 'Gray'
                  })
                .selector('edge.running.active')
                  .css({
                    'line-color': 'Black',
                    'target-arrow-color': 'Black'
                  })
                .selector('edge.accepting.active')
                  .css({
                    'line-color': 'LimeGreen',
                    'target-arrow-color': 'LimeGreen'
                  }),
          elements: eles,
          ready: function() {
            deferred.resolve(this);
            var clickstart;
            var clickstop = 0;
            var del = false;

            var tapx;
            var tapy;

            this.on('vmousedown', function(e) {
              // for node placment with context menu
              clickstart = e.timeStamp;
              tapx = e.cyPosition.x;
              tapy = e.cyPosition.y;
            });

            function doMouseUp(e) {
              var element = e.cyTarget;
              clickstop = e.timeStamp - clickstart;
              if (clickstop >= 750) {
                resetElementColors();
                cy.remove('.toDelete');
                var deleted = element.data('label');
                if (del && element.isNode() && element.hasClass('nnode')) {
                  cy.nodes('.nnode').forEach(function(n) {
                    if (n.data('label') && n.data('label') > deleted) {
                      var newLabel = n.data('label') - 1;
                      n.data('label', newLabel);
                    }
                  });
                }
                if (del && element.isNode() && element.hasClass('submachine')) {
                  cy.nodes('.submachine').forEach(function(n) {
                    if (n.data('label') &&
                      Number(n.data('label').replace('M', '')) > Number(deleted.replace('M', ''))) {
                      var newLabel = 'M' + String(Number(n.data('label').replace('M', '')) - 1);
                      n.data('label', newLabel);
                    }
                  });
                }
              }
              element.removeClass('toDelete');
              clickstart = 0;
              del = false;
            }

            this.on('vmouseup', 'node', function(e) {
              doMouseUp(e);
            });

            this.on('vmouseup', 'edge', function(e) {
              doMouseUp(e);
            });

            var edgedrag = false;
            var draggedEdge;
            this.on('vmousedown', 'edge', function(e) {
              cy.panningEnabled(false);
              draggedEdge = e.cyTarget;
              edgedrag = true;
            });

            this.on('vmousemove', function(e) {
              if (edgedrag) {
                var dx = e.cyPosition.x - draggedEdge.source().position().x;
                var dy = e.cyPosition.y - draggedEdge.source().position().y;
                var angle = Math.atan2(dy, dx);
                if (angle > -Math.PI / 8 || (angle >= 0 && angle <= Math.PI / 8)) {
                  draggedEdge.data({ 'direction': '0' });
                  draggedEdge.css({ 'loop-direction': '0' });
                } else if (angle >= -Math.PI * 3 / 8) {
                  draggedEdge.data({ 'direction': '-45deg' });
                  draggedEdge.css({ 'loop-direction': '-45deg' });
                } else if (angle >= -Math.PI * 5 / 8) {
                  draggedEdge.data({ 'direction': '-90deg' });
                  draggedEdge.css({ 'loop-direction': '-90deg' });
                } else if (angle >= -Math.PI * 7 / 8) {
                  draggedEdge.data({ 'direction': '-135deg' });
                  draggedEdge.css({ 'loop-direction': '-135deg' });
                } else if (angle < -Math.PI * 7 / 8 || angle > Math.PI * 7 / 8) {
                  draggedEdge.data({ 'direction': '-180deg' });
                  draggedEdge.css({ 'loop-direction': '-180deg' });
                }
                if (angle >= Math.PI * 5 / 8) {
                  draggedEdge.data({ 'direction': '135deg' });
                  draggedEdge.css({ 'loop-direction': '135deg' });
                } else if (angle >= Math.PI * 3 / 8) {
                  draggedEdge.data({ 'direction': '90deg' });
                  draggedEdge.css({ 'loop-direction': '90deg' });
                } else if (angle >= Math.PI / 8) {
                  draggedEdge.data({ 'direction': '45deg' });
                  draggedEdge.css({ 'loop-direction': '45deg' });
                }
              }
            });

            this.on('vmouseup', function(e) {
              edgedrag = false;
              cy.panningEnabled(true);
            });


            function doTapHold(e) {
              var element = e.cyTarget;
              if (!(element.id() === 'start' || element.id() === '0')) {
                element.addClass('toDelete');
                del = true;
              }
            }

            this.on('drag', 'node', function(e) {
              var node = e.cyTarget;
              node.removeClass('toDelete');
            });

            this.on('taphold', 'node', function(e) {
              doTapHold(e);
            });

            this.on('taphold', 'edge', function(e) {
              doTapHold(e);
            });

            var tappedBefore;
            var tappedTimeout;
            this.on('tap', 'node', function(e) {
              var node = e.cyTarget;
              if (tappedTimeout && tappedBefore) {
                clearTimeout(tappedTimeout);
              }
              if (tappedBefore === node) {
                node.trigger('doubleTap');
                tappedBefore = null;
              } else {
                tappedTimeout = setTimeout(function() {
                  tappedBefore = null;
                }, 300);
                tappedBefore = node;
              }
            });

            function toggleAccept(node) {
              if (!node.data().accept) {
                node.data().accept = true;
                node.addClass('accept');
                resetElementColors();
                if (node.data().start) {
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') - 2
                  });
                }
              } else {
                node.data().accept = false;
                node.removeClass('accept');
                resetElementColors();
                if (node.data().start) {
                  cy.$('#start').position({
                    x: cy.$('#start').position('x') + 2
                  });
                }
              }
            }

            function editSubmachine(node) {
              console.log('gonna edit the submachine for ' + node);
            }

            if (machine !== 'tm') { // accept states only for FSAs and PDAs
              this.on('click', 'node', function(e) {
                var node = e.cyTarget;
                if (!node.hasClass('submachine')) {
                  toggleAccept(node);
                } else {
                  editSubmachine(node);
                }
              });

              this.on('doubleTap', function(e) {
                var node = e.cyTarget;
                if (!node.hasClass('submachine')) {
                  toggleAccept(node);
                } else {
                  editSubmachine(node);
                }
                node.trigger('mouseout');
              });
            }

            this.on('cxttap', 'node', function(e) {
              var node = e.cyTarget;
              node.removeClass('toDelete');
              del = false;
            });

            this.on('drag', '#0', function(e) {
              cy.$('#start').position({
                x: cy.$('#0').position('x') - (e.cyTarget.data().accept ? 34 : 32),
                y: cy.$('#0').position('y')
              });
            });

            this.$('#start').ungrabify();
            this.$('#start').unselectify();
            this.$('#start').position({
              x: this.$('#0').position('x') - 32,
              y: this.$('#0').position('y')
            });

            this.on('mouseout', 'node', function() {
              // ugly hack to force edghandles to
              // disappear through re-rendering
              cy.panBy({ x: 0, y: 0 });
            });

            var defaults = {
              preview: true, // whether to show added edges preview before releasing selection
              stackOrder: 4, // Controls stack order of edgehandles canvas element by setting it's z-index
              handleSize: 15, // the size of the edge handle put on nodes
              handleColor: 'rgba(167, 164, 138, 0.70)', // the colour of the handle and the line drawn from it
              handleLineType: 'ghost', // can be 'ghost' for real edge, 'straight' for a straight line, or 'draw' for a draw-as-you-go line
              handleLineWidth: 1, // width of handle line in pixels
              handleNodes: '.enode', // selector/filter function for whether edges can be made from a given node
              hoverDelay: 150, // time spend over a target node before it is considered a target selection
              cxt: false, // whether cxt events trigger edgehandles (useful on touch)
              enabled: true, // whether to start the plugin in the enabled state
              toggleOffOnLeave: true, // whether an edge is cancelled by leaving a node (true), or whether you need to go over again to cancel (false; allows multiple edges in one pass)
              edgeType: function(sourceNode, targetNode) {
                // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
                // returning null/undefined means an edge can't be added between the two nodes
                return 'flat';
              },
              loopAllowed: function(node) {
                // for the specified node, return whether edges from itself to itself are allowed
                return true;
              },
              nodeLoopOffset: -50, // offset for edgeType: 'node' loops
              nodeParams: function(sourceNode, targetNode) {
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for intermediary node
                return {};
              },
              edgeParams: function(sourceNode, targetNode, i) {
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for edge
                // NB: i indicates edge index in case of edgeType: 'node'
                return {};
              },
              start: function(sourceNode) {
                // fired when edgehandles interaction starts (drag on handle)
              },
              complete: function(sourceNode, targetNodes, addedEntities) {
                resetElementColors();
                addedEntities[0].data({ 'direction': '-90deg', 'sweep': '1rad' });
                angular.element('[ng-controller=AddEdgeModalController]').scope().open('sm', addedEntities);
              },
              stop: function(sourceNode) {
                // fired when edgehandles interaction is stopped
                // (either complete with added edges or incomplete)

              }
            };
            this.edgehandles(defaults);

            var menuDefaults = {
              menuRadius: 100, // the radius of the circular menu in pixels
              selector: 'core', // elements matching this Cytoscape.js selector will trigger cxtmenus
              commands: [ // an array of commands to list in the menu or a function that returns the array
                { // example command
                  // fillColor: 'rgba(100, 100, 100, 0.75)', // optional: custom background color for item
                  content: '<span class="cxtmenutext noSelect">Add<br>node</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    resetElementColors();
                    if (e === cy) {
                      var ind = cy.nodes('.nnode').length;
                      cy.add({
                        group: 'nodes',
                        data: { label: ind,
                                weight: 75 },
                        classes: 'enode nnode',
                        position: { x: tapx, y: tapy }
                      });
                    }// `ele` holds the reference to the active element
                    // necessary hack to ensure that newly created
                    // nodes don't flicker. Toggles accept state on start state
                    toggleAccept(cy.nodes().eq(1));
                    toggleAccept(cy.nodes().eq(1));
                  }
                },
                { // example command
                  // fillColor: 'rgba(100, 100, 100, 0.75)', // optional: custom background color for item
                  content: '<span class="cxtmenutext noSelect">Add<br>comment</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    console.log('comment'); // `ele` holds the reference to the active element
                  }
                },
                { // example command
                  // fillColor: 'rgba(100, 100, 100, 0.75)', // optional: custom background color for item
                  content: '<span class="cxtmenutext noSelect">Add<br>submachine</span>', // html/text content to be displayed in the menu
                  select: function(e) { // a function to execute when the command is selected
                    resetElementColors();
                    if (e === cy) {
                      var ind = cy.nodes('.submachine').length;
                      var smlabel = 'M' + ind;
                      cy.add({
                        group: 'nodes',
                        data: { label: smlabel,
                                weight: 75 },
                        classes: 'submachine enode',
                        position: { x: tapx, y: tapy }
                      });
                    }// `ele` holds the reference to the active element
                    // necessary hack to ensure that newly created
                    // nodes don't flicker. Toggles accept state on start state
                    toggleAccept(cy.nodes().eq(1));
                    toggleAccept(cy.nodes().eq(1));
                  }
                }
              ], // function( ele ){ return [  ] }, // example function for commands
              fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
              activeFillColor: 'rgba(167, 164, 138, 0.50)', // the colour used to indicate the selected command
              activePadding: 20, // additional size in pixels for the active command
              indicatorSize: 24, // the size in pixels of the pointer to the active command
              separatorWidth: 3, // the empty spacing in pixels between successive commands
              spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
              minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
              maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
              openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
              itemColor: 'white', // the colour of text in the command's content
              itemTextShadowColor: 'black', // the text shadow colour of the command's content
              zIndex: 9999 // the z-index of the ui div
            };
            var cxtmenuApi = this.cxtmenu(menuDefaults);
          }
        });
      });
      return deferred.promise;
    };
    return automatonGraph;
  }
}());

(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('DemoService', DemoService);

  DemoService.$inject = ['$resource'];

  function DemoService($resource) {
    return $resource('api/demos/:automatonId', {
      automatonId: '@_id'
    });
  }
}());

/* global cytoscape */
(function () {
  'use strict';

  angular
    .module('automata.services')
    .factory('tape', tape);

  tape.$inject = ['$timeout'];

  function tape($timeout) {
    var tape = {
      focusNext: function (event, index, automaton) {
      // changes focus to the next tape cell when a key is pressed
        var nextInd;
        if (event.keyCode === 8) {
          // automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
          automaton.tape.contents[index] = '';
          // backspace key
          if (index > 0) {
            nextInd = index - 1;
          } else {
            nextInd = index;
          }
        } else if (event.keyCode === 37) {
          // leftarrow
          if (index > 0) {
            nextInd = index - 1;
          } else {
            automaton.tape.contents.unshift(' ');
            nextInd = 0;
            angular.element(document.querySelector('.cell-' + nextInd))[0].blur();
          }
        } else {
          automaton.tape.contents[index] = String.fromCharCode(event.keyCode);
          nextInd = index + 1;
          if (automaton.tape.contents.length === nextInd) {
            automaton.tape.contents.push(' ');
          }
        }
        $timeout(function() {
          angular.element(document.querySelector('.cell-' + nextInd))[0].focus();
        }, 0);
      },
      movePosition: function(move, automaton) {
        automaton.tape.position = automaton.tape.position + move;
        if (automaton.tape.position < 0) {
          automaton.tape.contents.unshift(' ');
          automaton.tape.position = 0;
        }
      },
      setContent: function(position, automaton, value) {
        automaton.tape.contents[position] = value;
      }
    };
    return tape;
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('core.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .run(routeFilter);

  routeFilter.$inject = ['$rootScope', '$state', 'Authentication'];

  function routeFilter($rootScope, $state, Authentication) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      // Check authentication before changing state
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;

        for (var i = 0, roles = toState.data.roles; i < roles.length; i++) {
          if ((roles[i] === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(roles[i]) !== -1)) {
            allowed = true;
            break;
          }
        }

        if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.transitionTo('forbidden');
          } else {
            $state.go('authentication.signin').then(function () {
              // Record previous state
              storePreviousState(toState, toParams);
            });
          }
        }
      }
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      // Record previous state
      storePreviousState(fromState, fromParams);
    }

    // Store previous state
    function storePreviousState(state, params) {
      // only store this state if it shouldn't be ignored
      if (!state.data || !state.data.ignoreState) {
        $state.previous = {
          state: state,
          params: params,
          href: $state.href(state, params)
        };
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService'];

  function HeaderController($scope, $state, Authentication, menuService) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  function HomeController() {
    var vm = this;
  }
}());

(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$interpolate', '$state'];

  function pageTitle($rootScope, $interpolate, $state) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var applicationCoreTitle = 'MEAN.js',
          separeteBy = ' - ';
        if (toState.data && toState.data.pageTitle) {
          var stateTitle = $interpolate(toState.data.pageTitle)($state.$current.locals.globals);
          element.html(applicationCoreTitle + separeteBy + stateTitle);
        } else {
          element.html(applicationCoreTitle);
        }
      }
    }
  }
}());

(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  function pageTitle($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var title = (getTitle($state.$current));
        $timeout(function () {
          element.text(title);
        }, 0, false);
      }

      function getTitle(currentState) {
        var applicationCoreTitle = 'Automata';
        var workingState = currentState;
        if (currentState.data) {
          workingState = (typeof workingState.locals !== 'undefined') ? workingState.locals.globals : workingState;
          var stateTitle = $interpolate(currentState.data.pageTitle)(workingState);
          return applicationCoreTitle + ' - ' + stateTitle;
        } else {
          return applicationCoreTitle;
        }
      }
    }
  }
}());

(function () {
  'use strict';

  // https://gist.github.com/rhutchison/c8c14946e88a1c8f9216

  angular
    .module('core')
    .directive('showErrors', showErrors);

  showErrors.$inject = ['$timeout', '$interpolate'];

  function showErrors($timeout, $interpolate) {
    var directive = {
      restrict: 'A',
      require: '^form',
      compile: compile
    };

    return directive;

    function compile(elem, attrs) {
      if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
          throw new Error('show-errors element does not have the \'form-group\' or \'input-group\' class');
        }
      }

      return linkFn;

      function linkFn(scope, el, attrs, formCtrl) {
        var inputEl,
          inputName,
          inputNgEl,
          options,
          showSuccess,
          initCheck = false,
          showValidationMessages = false;

        options = scope.$eval(attrs.showErrors) || {};
        showSuccess = options.showSuccess || false;
        inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

        if (!inputName) {
          throw new Error('show-errors element has no child input elements with a \'name\' attribute class');
        }

        scope.$watch(function () {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, toggleClasses);

        scope.$on('show-errors-check-validity', checkValidity);
        scope.$on('show-errors-reset', reset);

        function checkValidity(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            initCheck = true;
            showValidationMessages = true;

            return toggleClasses(formCtrl[inputName].$invalid);
          }
        }

        function reset(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            return $timeout(function () {
              el.removeClass('has-error');
              el.removeClass('has-success');
              showValidationMessages = false;
            }, 0, false);
          }
        }

        function toggleClasses(invalid) {
          el.toggleClass('has-error', showValidationMessages && invalid);

          if (showSuccess) {
            return el.toggleClass('has-success', showValidationMessages && !invalid);
          }
        }
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$q', '$injector', 'Authentication'];

  function authInterceptor($q, $injector, Authentication) {
    var service = {
      responseError: responseError
    };

    return service;

    function responseError(rejection) {
      if (!rejection.config.ignoreAuthModule) {
        switch (rejection.status) {
          case 401:
            // Deauthenticate the global user
            Authentication.user = null;
            $injector.get('$state').transitionTo('authentication.signin');
            break;
          case 403:
            $injector.get('$state').transitionTo('forbidden');
            break;
        }
      }
      // otherwise, default behaviour
      return $q.reject(rejection);
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('core')
    .factory('menuService', menuService);

  function menuService() {
    var shouldRender;
    var service = {
      addMenu: addMenu,
      addMenuItem: addMenuItem,
      addSubMenuItem: addSubMenuItem,
      defaultRoles: ['user', 'admin'],
      getMenu: getMenu,
      menus: {},
      removeMenu: removeMenu,
      removeMenuItem: removeMenuItem,
      removeSubMenuItem: removeSubMenuItem,
      validateMenuExistence: validateMenuExistence
    };

    init();

    return service;

    // Add new menu object by menu id
    function addMenu(menuId, options) {
      options = options || {};

      // Create the new menu
      service.menus[menuId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return service.menus[menuId];
    }

    // Add menu item object
    function addMenuItem(menuId, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Push new menu item
      service.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubMenuItem(menuId, options.state, options.items[i]);
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Add submenu item object
    function addSubMenuItem(menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          service.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            params: options.params || {},
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Get the menu object by menu id
    function getMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Return the menu object
      return service.menus[menuId];
    }

    function init() {
      // A private function for rendering decision
      shouldRender = function (user) {
        if (this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          if (!user) {
            return false;
          }

          for (var userRoleIndex in user.roles) {
            if (user.roles.hasOwnProperty(userRoleIndex)) {
              for (var roleIndex in this.roles) {
                if (this.roles.hasOwnProperty(roleIndex) && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      };

      // Adding the topbar menu
      addMenu('topbar', {
        roles: ['*']
      });
    }

    // Remove existing menu object by menu id
    function removeMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      delete service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeMenuItem(menuId, menuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items.hasOwnProperty(itemIndex) && service.menus[menuId].items[itemIndex].state === menuItemState) {
          service.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Remove existing menu object by menu id
    function removeSubMenuItem(menuId, submenuItemState) {
      // Validate that the menu exists
      service.validateMenuExistence(menuId);

      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (this.menus[menuId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.menus[menuId].items[itemIndex].items) {
            if (this.menus[menuId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
              service.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the menu object
      return service.menus[menuId];
    }

    // Validate menu existance
    function validateMenuExistence(menuId) {
      if (menuId && menuId.length) {
        if (service.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
    }
  }
}());

(function () {
  'use strict';

  // Create the Socket.io wrapper service
  angular
    .module('core')
    .factory('Socket', Socket);

  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      emit: emit,
      on: on,
      removeListener: removeListener,
      socket: null
    };

    connect();

    return service;

    // Connect to Socket.io server
    function connect() {
      // Connect only when authenticated
      if (Authentication.user) {
        service.socket = io();
      }
    }

    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        service.socket.emit(eventName, data);
      }
    }

    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    }

    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        service.socket.removeListener(eventName);
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Users List'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());

(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings password'
        }
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
        controller: 'SocialAccountsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings accounts'
        }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        controller: 'ChangeProfilePictureController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signup'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        }
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['$scope', '$filter', 'AdminService'];

  function UserListController($scope, $filter, AdminService) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;

    AdminService.query(function (data) {
      vm.users = data;
      vm.buildPager();
    });

    function buildPager() {
      vm.pagedItems = [];
      vm.itemsPerPage = 15;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.users, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    function pageChanged() {
      vm.figureOutItemsToDisplay();
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve'];

  function UserController($scope, $state, $window, Authentication, user) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = user;
    vm.remove = remove;
    vm.update = update;

    function remove(user) {
      if ($window.confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          vm.users.splice(vm.users.indexOf(user), 1);
        } else {
          vm.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = vm.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        vm.error = errorResponse.data.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;

    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      $http.post('/api/auth/signup', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    function signin(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      $http.post('/api/auth/signin', vm.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        vm.error = response.message;
      });
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('PasswordController', PasswordController);

  PasswordController.$inject = ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator'];

  function PasswordController($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    var vm = this;

    vm.resetUserPassword = resetUserPassword;
    vm.askForPasswordReset = askForPasswordReset;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    function askForPasswordReset(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', vm.credentials).success(function (response) {
        // Show user success message and clear form
        vm.credentials = null;
        vm.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        vm.credentials = null;
        vm.error = response.message;
      });
    }

    // Change user password
    function resetUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        vm.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'PasswordValidator'];

  function ChangePasswordController($scope, $http, Authentication, PasswordValidator) {
    var vm = this;

    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;

    // Change user password
    function changeUserPassword(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');

        return false;
      }

      $http.post('/api/users/password', vm.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'vm.passwordForm');
        vm.success = true;
        vm.passwordDetails = null;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangeProfilePictureController', ChangeProfilePictureController);

  ChangeProfilePictureController.$inject = ['$timeout', 'Authentication', 'Upload'];

  function ChangeProfilePictureController($timeout, Authentication, Upload) {
    var vm = this;

    vm.user = Authentication.user;
    vm.fileSelected = false;

    vm.upload = function (dataUrl, name) {
      vm.success = vm.error = null;

      Upload.upload({
        url: 'api/users/picture',
        data: {
          newProfilePicture: Upload.dataUrltoBlob(dataUrl, name)
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response) {
      // Show success message
      vm.success = true;

      // Populate user object
      vm.user = Authentication.user = response;

      // Reset form
      vm.fileSelected = false;
      vm.progress = 0;
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(response) {
      vm.fileSelected = false;

      // Show error message
      vm.error = response.message;
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {
      vm.success = vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');

        vm.success = true;
        Authentication.user = response;
      }, function (response) {
        vm.error = response.data.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SocialAccountsController', SocialAccountsController);

  SocialAccountsController.$inject = ['$scope', '$http', 'Authentication'];

  function SocialAccountsController($scope, $http, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;

    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return (vm.user.additionalProvidersData && Object.keys(vm.user.additionalProvidersData).length);
    }

    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }

    // Remove a user social account
    function removeUserSocialAccount(provider) {
      vm.success = vm.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        vm.success = true;
        vm.user = Authentication.user = response;
      }).error(function (response) {
        vm.error = response.message;
      });
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$scope', 'Authentication'];

  function SettingsController($scope, Authentication) {
    var vm = this;

    vm.user = Authentication.user;
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordValidator', passwordValidator);

  passwordValidator.$inject = ['PasswordValidator'];

  function passwordValidator(PasswordValidator) {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      ngModel.$validators.requirements = function (password) {
        var status = true;
        if (password) {
          var result = PasswordValidator.getResult(password);
          var requirementsIdx = 0;

          // Requirements Meter - visual indicator for users
          var requirementsMeter = [{
            color: 'danger',
            progress: '20'
          }, {
            color: 'warning',
            progress: '40'
          }, {
            color: 'info',
            progress: '60'
          }, {
            color: 'primary',
            progress: '80'
          }, {
            color: 'success',
            progress: '100'
          }];

          if (result.errors.length < requirementsMeter.length) {
            requirementsIdx = requirementsMeter.length - result.errors.length - 1;
          }

          scope.requirementsColor = requirementsMeter[requirementsIdx].color;
          scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

          if (result.errors.length) {
            scope.getPopoverMsg = PasswordValidator.getPopoverMsg();
            scope.passwordErrors = result.errors;
            status = false;
          } else {
            scope.getPopoverMsg = '';
            scope.passwordErrors = [];
            status = true;
          }
        }
        return status;
      };
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordVerify', passwordVerify);

  function passwordVerify() {
    var directive = {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      var status = true;
      scope.$watch(function () {
        var combined;
        if (scope.passwordVerify || ngModel) {
          combined = scope.passwordVerify + '_' + ngModel;
        }
        return combined;
      }, function (value) {
        if (value) {
          ngModel.$validators.passwordVerify = function (password) {
            var origin = scope.passwordVerify;
            return (origin === password);
          };
        }
      });
    }
  }
}());

(function () {
  'use strict';

  // Users directive used to force lowercase input
  angular
    .module('users')
    .directive('lowercase', lowercase);

  function lowercase() {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  }
}());

(function () {
  'use strict';

  // Authentication service for user variables

  angular
    .module('users.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$window'];

  function Authentication($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
}());

(function () {
  'use strict';

  // PasswordValidator service used for testing the password strength
  angular
    .module('users.services')
    .factory('PasswordValidator', PasswordValidator);

  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    var service = {
      getResult: getResult,
      getPopoverMsg: getPopoverMsg
    };

    return service;

    function getResult(password) {
      var result = owaspPasswordStrengthTest.test(password);
      return result;
    }

    function getPopoverMsg() {
      var popoverMsg = 'Please enter a passphrase or password with 10 or more characters, numbers, lowercase, uppercase, and special characters.';

      return popoverMsg;
    }
  }

}());

(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('users.services')
    .factory('UsersService', UsersService);

  UsersService.$inject = ['$resource'];

  function UsersService($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }

  // TODO this should be Users service
  angular
    .module('users.admin.services')
    .factory('AdminService', AdminService);

  AdminService.$inject = ['$resource'];

  function AdminService($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
