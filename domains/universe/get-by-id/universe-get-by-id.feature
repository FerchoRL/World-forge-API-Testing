@api @universe @universe-get-by-id
Feature: Universe - Get by ID (GET /universes/:id)

  Background:
    Given the Universe service is available

  @tc-universe-get-01
  Scenario: TC-UNIVERSE-GET-01 - Existing universe ID - Returns universe (200)
    When I request the universe by id from test data
    Then the universe get by id endpoint should respond with status code 200
    And the response should contain a universe
    And the universe should have a valid id
    And the universe should have a name
    And the universe should have a valid status
    And the universe should have a premise
    And the universe rules should be valid if present
    And the universe notes should be valid if present

  @tc-universe-get-02
  Scenario: TC-UNIVERSE-GET-02 - Empty/blank universe ID - Returns 400
    When I request the universe by id "%20"
    Then the universe get by id endpoint should respond with status code 400
    And the universe get by id response error message should be "Universe id is required"

  @tc-universe-get-03
  Scenario: TC-UNIVERSE-GET-03 - Non-existent universe ID - Returns 404
    When I request the universe by id "universe-does-not-exist"
    Then the universe get by id endpoint should respond with status code 404
    And the universe get by id response error message should be "Universe universe-does-not-exist not found"

  @tc-universe-get-04 @db
  Scenario: TC-UNIVERSE-GET-04 - Universe data matches database record (MongoDB)
    When I request the universe by id from test data
    Then the universe get by id endpoint should respond with status code 200
    And the response should match the universe stored in the database
