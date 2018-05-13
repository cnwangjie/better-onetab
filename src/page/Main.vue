<template>
<v-app>
  <v-toolbar
    color="primary"
  >
    <v-toolbar-title class="white--text">OneTab</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon exact :to="'/app/'">
      <v-icon>fas fa-list</v-icon>
    </v-btn>
    <v-btn icon exact :to="'/app/options'">
      <v-icon>fas fa-cog</v-icon>
    </v-btn>
    <v-btn icon :to="'https://github.com/cnwangjie/better-onetab'">
      <v-icon>fab fa-github</v-icon>
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
