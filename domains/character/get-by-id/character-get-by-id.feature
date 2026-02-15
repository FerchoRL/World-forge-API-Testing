@api @character @getById
Feature: Character – Get by ID (GET /characters/:id)

  Background:
    Given the Character service is available

  @tc-char-get-01
  Scenario: TC-CHAR-GET-01 – Existing character ID – Returns character
    When I request the character by id "char_ahr8qytu"
    Then the character should be returned successfully
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
  Scenario: TC-CHAR-GET-02 – Non-existent character ID – Returns 404
    When I request the character by id "char_41x8tz7k999"
    Then the get by id response should return a 404 error with message "Character char_41x8tz7k999 not found"

  @tc-char-get-04 @error @skip
  Scenario: TC-CHAR-GET-04 – Internal server error – Returns 500
    When I request the character by id "char_41x8tz7k" and an internal error occurs
    Then the response should return a 500 internal server error

  @tc-char-get-05 @db
  Scenario: TC-CHAR-GET-05 – Character data matches database record
    When I request the character by id "char_ahr8qytu"
    Then the response should match the character stored in the database
