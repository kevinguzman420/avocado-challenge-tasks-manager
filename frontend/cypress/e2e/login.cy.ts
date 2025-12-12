describe('Login Page', () => {
  beforeEach(() => {
    // Intercept the login API call and mock a successful response
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'regular',
          is_active: true,
        },
      },
    }).as('loginRequest');

    // Intercept the redirect API call after login and mock a response
    // This assumes your dashboard makes a call to get tasks, for example.
    // Adjust this to an actual API call your dashboard makes.
    cy.intercept('GET', '/api/v1/tasks/', {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
        skip: 0,
        limit: 100,
      },
    }).as('getTasks');
  });

  it('should allow a user to log in and be redirected to the dashboard', () => {
    // Visit the login page
    cy.visit('/login');

    // Fill in the form
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('password123');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Assert that the user is redirected to the dashboard
    // Check for a URL change and a dashboard-specific element
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Panel de Control').should('be.visible'); // Assumes 'Panel de Control' is a title on the dashboard
  });

  it('should show an error message on failed login', () => {
    // Override the intercept for this specific test to simulate a failure
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 401,
      body: {
        detail: 'Incorrect email or password',
      },
    }).as('failedLoginRequest');

    cy.visit('/login');

    cy.get('input[id="email"]').type('wrong@example.com');
    cy.get('input[id="password"]').type('wrongpassword');

    cy.get('button[type="submit"]').click();

    cy.wait('@failedLoginRequest');

    // Assert that the error message is displayed
    cy.contains('Incorrect email or password').should('be.visible');
  });
});