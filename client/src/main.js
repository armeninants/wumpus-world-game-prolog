import jQuery from 'jquery/src/jquery.js' 
import 'bootstrap-sass/assets/javascripts/bootstrap.js'
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss' 
import './styles/sticky-footer.scss'
// import './styles/bootstrap1.css'
// import 'font-awesome/scss/font-awesome.scss'

import 'bootstrap-select/js/bootstrap-select.js'
import 'bootstrap-select/sass/bootstrap-select.scss'


// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
