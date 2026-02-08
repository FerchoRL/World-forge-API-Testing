Feature: Health check

  Scenario: Backend service is healthy
    When I check the health endpoint
    Then the service should respond as healthy
