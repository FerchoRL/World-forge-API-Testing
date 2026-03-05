@api @character @character-list
Feature: Character – List (GET /characters

  Background:
    Given the Character service is available

  @tc-char-list-01
  Scenario: TC-CHAR-LIST-01 – Default pagination – Returns first page
    When I request the list of characters without pagination parameters
    Then the response should contain the default pagination values for character list

  @tc-char-list-02
  Scenario: TC-CHAR-LIST-02 – Valid pagination parameters – Respects page and limit
    When I request the list of characters with page 2 and limit 5
    Then the response should respect the pagination values page 2 and limit 5

  @tc-char-list-03
  Scenario: TC-CHAR-LIST-03 – Limit above max – Caps limit to 50
    When I request the list of characters with limit 999
    Then the response should cap the limit to 50

  @tc-char-list-04-07
  Scenario Outline: TC-CHAR-LIST-04 to 07 – Invalid limit values return 400
    When I request the list of characters with limit <limit>
    Then the response should return a 400 error with message "Limit must be a positive integer"

    Examples:
      | limit | # TC                 |
      |     0 | # TC-04: zero        |
      |    -5 | # TC-05: negative    |
      | abc   | # TC-06: non-numeric |
      | false | # TC-07: boolean     |

  @tc-char-list-08-10
  Scenario Outline: TC-CHAR-LIST-08 to 10.1 – Invalid page values return 400
    When I request the list of characters with page <page>
    Then the response should return a 400 error with message "Page must be a positive integer"

    Examples:
      | page | # TC                 |
      |    0 | # TC-08: zero        |
      |   -3 | # TC-09: negative    |
      | abc  | # TC-10: non-numeric |
      | true | # TC-10.1: boolean   |

  @tc-char-list-11
  Scenario: TC-CHAR-LIST-11 – High page number – Returns empty list
    When I request the list of characters with page 9999
    Then the response should return an empty character list for page 9999

  @tc-char-list-12
  Scenario: TC-CHAR-LIST-12 – Unknown query parameters – Ignored by backend
    When I request the list of characters with unknown query parameters
    Then the response should ignore unknown query parameters

  @tc-char-list-14 @contract
  Scenario: TC-CHAR-LIST-14 – Character list returns valid CharacterDTO structure
    When I request the list of characters without pagination parameters
    Then each returned character should match the CharacterDTO contract

  @tc-char-list-15
  Scenario: TC-CHAR-LIST-15 – Search by name – Returns 200 + ListCharactersResponse
    When I request the list of characters with pagination parameters and search "akira"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should contain "akira" in name

  @tc-char-list-16
  Scenario: TC-CHAR-LIST-16 – Search by categories field – semantic validation
    When I request the list of characters with pagination parameters and search "PersonajeTrágico"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should contain "PersonajeTrágico" in categories

  @tc-char-list-17
  Scenario: TC-CHAR-LIST-17 – Search by identity field – semantic validation
    When I request the list of characters with pagination parameters and search "Una joven energética y excéntrica"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should contain "Una joven energética y excéntrica" in identity

  @tc-char-list-18
  Scenario: TC-CHAR-LIST-18 – Search by inspirations field – semantic validation
    When I request the list of characters with pagination parameters and search "Hu Tao (Genshin Impact)"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should contain "Hu Tao (Genshin Impact)" in inspirations

  @tc-char-list-19
  Scenario: TC-CHAR-LIST-19 – Search with normalized spaces – Returns 200 + ListCharactersResponse
    When I request the list of characters with pagination parameters and search "  Hu Tao  "
    Then the response should respect the pagination values page 1 and limit 10
    And the response should match with the requested search trimmed search for "Hu Tao"

  @tc-char-list-20
  Scenario: TC-CHAR-LIST-20 – Filter by status – Returns 200 + ListCharactersResponse
    When I request the list of characters with pagination parameters and status "ACTIVE"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should have status "ACTIVE"

  @tc-char-list-21
  Scenario: TC-CHAR-LIST-21 – Search + status combined – Returns 200 + ListCharactersResponse
    When I request the list of characters with page 1, limit 10, search "PersonajeTrágico" and status "ARCHIVED"
    Then the response should respect the pagination values page 1 and limit 10
    And all returned characters should contain "PersonajeTrágico" in categories
    And all returned characters should have status "ARCHIVED"

  @tc-char-list-22
  Scenario: TC-CHAR-LIST-22 – Page 2 over filtered results – Returns 200 + ListCharactersResponse
    When I request the list of characters with page 2, limit 10, search "akira" and status "ACTIVE"
    Then the response should respect the pagination values page 2 and limit 10

  @tc-char-list-23
  Scenario: TC-CHAR-LIST-23 – Limit above max with search – Caps to 50
    When I request the list of characters with limit 999 and search "akira"
    Then the response should cap the limit to 50

  @tc-char-list-24
  Scenario: TC-CHAR-LIST-24 – Blank search – Ignores text filter
    When I request the list of characters with pagination parameters and search "   "
    Then the response should respect the pagination values page 1 and limit 10

  @tc-char-list-25
  Scenario Outline: TC-CHAR-LIST-25 – Invalid status values – Returns 400
    When I request the list of characters with pagination parameters and status "<status>"
    Then the response should return a 400 error with message "Status must be DRAFT, ACTIVE or ARCHIVED"

    Examples:
      | status |
      | ALL    |
      | true   |
      | false  |
      | 123    |
      | null   |
      |        |

  @tc-char-list-26
  Scenario: TC-CHAR-LIST-26 – Search exceeds 120 chars – Returns 400
    When I request the list of characters with pagination parameters and search longer than 120 characters
    Then the response should return a 400 error with message "Search must be at most 120 characters"
