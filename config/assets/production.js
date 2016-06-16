'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'https://fonts.googleapis.com/css?family=Francois+One',
        'public/fonts/automaton-icons/fonts',
        'public/fonts/automaton-icons/styles.css',
        'public/lib/bootstrap/dist/css/bootstrap.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/jquery-ui/jquery-ui.min.js',
        'public/lib/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/js/my_cytoscape.min.js',
        'public/lib/cytoscape-edgehandles/cytoscape-edgehandles.js',
        'public/lib/ng-context-menu/dist/ng-context-menu.min.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.js'
  }
};
