@api @character @character-create-from-archived
Feature: Character - Create from archived (POST /characters/:id/create-from-archived)

  Background:
    Given the Character service is available

  @tc-character-create-from-archived-01
  Scenario: TC-CHARACTER-CREATE-FROM-ARCHIVED-01 - Creates a new Character from an ARCHIVED source - Returns 201
    Given I have an archived source character for create from archived
    When I create a character from the archived source
    Then the create from archived character endpoint should respond with status code 201
    And the created character from archived should have a different id than source
    And the created character from archived should default status to DRAFT
    And the created character from archived should preserve the archived source data

  @tc-character-create-from-archived-02
  Scenario: TC-CHARACTER-CREATE-FROM-ARCHIVED-02 - Does not modify the archived source Character - Returns 201
    Given I have an archived source character for create from archived
    When I create a character from the archived source
    Then the create from archived character endpoint should respond with status code 201
    And the archived source character should remain unchanged after creation

  @tc-character-create-from-archived-03
  Scenario: TC-CHARACTER-CREATE-FROM-ARCHIVED-03 - Source Character does not exist - Returns 404
    When I create a character from a non existing archived source
    Then the create from archived character endpoint should respond with status code 404
    And the create from archived character error message should be "Character character-does-not-exist not found"

  @tc-character-create-from-archived-04
  Scenario Outline: TC-CHARACTER-CREATE-FROM-ARCHIVED-04 - Invalid or blank sourceCharacterId - Returns 400
    When I create a character from archived source id "<id>"
    Then the create from archived character endpoint should respond with status code 400
    And the create from archived character error message should be "Source character id is required"

    Examples:
      | id        |
      | %20       |
      | __SPACE__ |

  @tc-character-create-from-archived-05
  Scenario Outline: TC-CHARACTER-CREATE-FROM-ARCHIVED-05 - Source Character is not in ARCHIVED status - Returns 400
    Given I have a non archived source character for create from archived with status "<status>"
    When I create a character from the non archived source
    Then the create from archived character endpoint should respond with status code 400
    And the create from archived character error message should be "Only ARCHIVED characters can be used as source"

    Examples:
      | status |
      | ACTIVE |
      | DRAFT  |

  @tc-character-create-from-archived-06
  Scenario Outline: TC-CHARACTER-CREATE-FROM-ARCHIVED-06 - Duplicate name against ACTIVE or DRAFT character - Returns 409
    Given I have an archived source character for create from archived with duplicated name against status "<status>"
    When I create a character from the archived source
    Then the create from archived character endpoint should respond with status code 409
    And the create from archived character error message should be "Character name already exists for an ACTIVE or DRAFT character"

    Examples:
      | status |
      | ACTIVE |
      | DRAFT  |