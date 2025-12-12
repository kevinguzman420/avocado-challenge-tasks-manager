describe('Smoke Test', () => {
  it('should visit the home page and see the main title', () => {
    cy.visit('/')
    cy.contains('Avocado Task Manager').should('be.visible') // Assuming your app has a main title like this
  })
})
