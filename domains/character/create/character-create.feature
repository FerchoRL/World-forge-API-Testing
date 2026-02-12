@api @character @create
Feature: Character – Create (POST /characters)

  Background:
    Given the Character service is available

  @tc-char-create-01
  Scenario: TC-CHAR-CREATE-01 – Valid payload – Returns 201 and persists character in database
    When I create a character with a valid payload
    Then the character should be created successfully
    And the created character should match the payload
    And the created character should be stored in the database
