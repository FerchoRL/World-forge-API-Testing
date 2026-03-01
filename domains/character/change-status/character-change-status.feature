@api @character @change-status
Feature: Character – Change Status (PATCH /characters/:id/status)

  Background:
    Given the Character service is available

  @tc-char-change-status-01 @tc-char-change-status-02 @tc-char-change-status-03
  Scenario Outline: TC-CHAR-CHANGE-STATUS-01/02/03 – Valid transitions – Returns 200
    When I request to change character status from "<from>" to "<to>"
    Then the change character status request should return status code 200
    And the changed character status should be <to>
    And the changed character id should match the source character id

    Examples:
      | from     | to       |
      | DRAFT    | ACTIVE   |
      | ACTIVE   | ARCHIVED |
      | ARCHIVED | ACTIVE   |

  @tc-char-change-status-04
  Scenario Outline: TC-CHAR-CHANGE-STATUS-04 – Empty/blank id – Returns 400
    When I request to change character status using raw id "<id>" to "ACTIVE"
    Then the change character status request should return status code 400
    And the change character status error should be "Character id is required"

    Examples:
      | id        |
      | %20       |
      | __SPACE__ |

  @tc-char-change-status-07
  Scenario Outline: TC-CHAR-CHANGE-STATUS-07 – Non-existing string id – Returns 404
    When I request to change character status using raw id "<id>" to "ACTIVE"
    Then the change character status request should return status code 404
    And the change character status error should be "Character <id> not found"

    Examples:
      | id    |
      | false |
      | null  |
      | abc   |
