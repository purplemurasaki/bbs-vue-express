<template>
  <div class="app">
    <header class="header">
      <h1 class="title">掲示板</h1>
      <nav>
        <RouterLink to="/">投稿一覧</RouterLink>
        <RouterLink to="/posts/new">投稿作成</RouterLink>
      </nav>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 20px;
}

nav {
  display: flex;
  gap: 12px;
}

.main {
  margin-top: 24px;
}
</style>

