; Tag keywords
[
  "@param"
  "@parameter"
  "@arg"
  "@argument"
  "@return"
  "@returns"
  "@access"
  "@author"
  "@content"
  "@deprecated"
  "@group"
  "@ignore"
  "@output"
  "@since"
  "@throw"
  "@todo"
  "@type"
  "@see"
  "@example"
  "@require"
  "@requires"
] @keyword

; Access modifiers
(tag_access
  ["public" "private"] @keyword.modifier)

; Reference types
(reference) @type

; Type names
(type_name) @type

; Variable names
(variable_name) @variable

; Version numbers
(version) @number

; Description text
(description) @comment
(line_description) @comment

; Example language identifier
(example_language) @label

; Code blocks
(code_block) @string

; See references
(see_reference) @function

; Group names
(group_name) @module

; Default values
(default_value) @string.special
