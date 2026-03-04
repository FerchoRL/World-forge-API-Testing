@api @universe @universe-create
Feature: Universe – Create (POST /universes)

  Background:
    Given the Universe service is available

  @tc-universe-create-01
  Scenario: TC-UNIVERSE-CREATE-01 – Crear universe con valores mínimos – Returns 201 and defaults to DRAFT
    When I create a universe with minimal valid payload
    Then the universe create endpoint should respond with status code 201
    And the universe response should contain the expected properties
    And the universe response properties should have the correct types
    And the created universe should default status to DRAFT
    And the created universe should be stored in the database

  @tc-universe-create-02
  Scenario Outline: TC-UNIVERSE-CREATE-02 – Crear universe con payload completo y status explícito (DRAFT | ACTIVE) – Returns 201
    When I create a universe with full valid payload and status <status>
    Then the universe create endpoint should respond with status code 201
    And the universe response should contain the expected properties
    And the universe response properties should have the correct types
    And the created universe response should match all values from the payload
    And the created universe should be stored in the database

    Examples:
      | status |
      | DRAFT  |
      | ACTIVE |
