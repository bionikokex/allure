# language: en
Feature: The test doesn't have an implementation

  # todo: scenario without implemented steps; shown in report for debugging purposes
  @bug_example
  Scenario: The test doesn't have an implementation
    When I open the page "https://playwright.dev/"
    Then there should be an error because the Then step is not implemented
