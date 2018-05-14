<template>
<v-app>
  <v-toolbar
    color="primary"
  >
    <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn dark icon exact :to="'/app/'">
      <v-icon dark>fas fa-list</v-icon>
    </v-btn>
    <v-btn dark icon exact :to="'/app/options'">
      <v-icon dark>fas fa-cog</v-icon>
    </v-btn>
    <v-btn dark icon href="https://github.com/cnwangjie/better-onetab">
      <v-icon dark>fab fa-github</v-icon>
    </v-btn>
  </v-toolbar>
  <v-content>
    <v-container>
      <router-view></router-view>
    </v-container>
  </v-content>
</v-app>
</template>
<script>
export default {
}
</script>
