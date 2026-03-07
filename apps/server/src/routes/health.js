async function healthRoutes(app) {
  app.get('/health', async () => ({ status: 'ok', timestamp: Date.now() }))
}

export default healthRoutes
