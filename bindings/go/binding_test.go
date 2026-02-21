package tree_sitter_sassdoc_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_sassdoc "github.com/simeonoff/tree-sitter-sassdoc/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_sassdoc.Language())
	if language == nil {
		t.Errorf("Error loading SassDoc grammar")
	}
}
