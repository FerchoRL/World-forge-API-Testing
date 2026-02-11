@api @character @getById
Feature: Character – Get by ID (GET /characters/:id)

  Background:
    Given the Character service is available

  @tc-char-get-01
  Scenario: TC-CHAR-GET-01 – Existing character ID – Returns character
    When I request the character by id char_41x8tz7k
    Then the response status should be 200
    And the response should contain a character
    And the character should have a valid id
    And the character should have a name
    And the character should have a valid status
    And the character should have categories
    And each category should be valid
    And the character should have an identity
    And the character should have inspirations
    And the character notes should be valid if present

  @tc-char-get-02
  Scenario: TC-CHAR-GET-02 – Non-existent character ID – Returns validation error
    When I request the character by id char_41x8tz7k999
    Then the response should return a 400 validation error for id char_41x8tz7k999

  @tc-char-get-03
  Scenario: TC-CHAR-GET-03 – Invalid character ID format – Returns validation error
    When I request the character by id abc123-CHARACTER
    Then the response should return a 400 validation error for id abc123-CHARACTER

  @tc-char-get-04 @error @skip
  Scenario: TC-CHAR-GET-04 – Internal server error – Returns 500
    When I request the character by id char_41x8tz7k and an internal error occurs
    Then the response should return a 500 internal server error

  @tc-char-get-05 @db @skip
  Scenario: TC-CHAR-GET-05 – Character data matches database record
    When I request the character by id char_41x8tz7k
    Then the response should match the character stored in the database
