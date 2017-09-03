<template>
  <div id="app">
    <Navbar></Navbar>
    <Sidebar></Sidebar>
    <Housemap></Housemap>
    <Login></Login>
    <Register></Register>
  </div>
</template>

<script>
//引入各个组件
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Housemap from './components/Housemap'
import Login from './components/Login'
import Register from './components/Register'

export default {
  name: 'app',
  components: {
    Navbar,
    Sidebar,
    Housemap,
    Login,
    Register
  }
}
</script>

<style>

</style>
