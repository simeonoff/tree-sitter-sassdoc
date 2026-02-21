import XCTest
import SwiftTreeSitter
import TreeSitterSassdoc

final class TreeSitterSassdocTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_sassdoc())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading SassDoc grammar")
    }
}
