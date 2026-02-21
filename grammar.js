/**
 * @file SassDoc grammar for tree-sitter
 * @author Simeon Simeonoff <simeon@simeonoff.ninja>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "sassdoc",

  extras: (_) => [
    /[ \t]+/,                               // Horizontal whitespace
    token(prec(2, /\n[ \t]*\/\/\/[ \t]?/)), // Newline + /// prefix
    token(prec(1, /\n/)),                   // Plain newline
  ],

  rules: {
    document: ($) => seq(
      // Optionally consume leading ///
      optional($._comment_marker),
      optional($.description),
      repeat($.tag),
    ),

    // Hidden: matches /// at start
    _comment_marker: (_) => token(seq("///", /[ \t]?/)),

    // Description: one or more lines of text before any @ tag
    description: ($) => repeat1($._description_line),

    // A single line of description (doesn't start with @)
    _description_line: (_) => /[^@\s\n][^@\n]*/,
    tag: ($) =>
      choice(
        $.tag_param,
        $.tag_return,
        $.tag_access,
        $.tag_author,
        $.tag_content,
        $.tag_deprecated,
        $.tag_group,
        $.tag_ignore,
        $.tag_output,
        $.tag_since,
        $.tag_throw,
        $.tag_todo,
        $.tag_type,
        $.tag_see,
        $.tag_example,
        $.tag_require,
      ),

    tag_param: ($) =>
      seq(
        choice("@param", "@parameter", "@arg", "@argument"),
        optional($.type),
        $.variable_name,
        optional($.default_value),
        optional($.tag_description),
      ),

    tag_access: (_$) => seq("@access", choice("public", "private")),

    tag_content: ($) => seq("@content", seq("[", $.line_description, "]")),

    tag_group: ($) => seq("@group", $.group_name),

    group_name: (_$) => /[\w-]+/,

    tag_deprecated: ($) => seq("@deprecated", $.line_description),

    tag_author: ($) => seq("@author", $.line_description),

    tag_ignore: ($) => seq("@ignore", $.line_description),

    tag_output: ($) => seq("@output", $.line_description),

    tag_since: ($) => seq("@since", $.version, optional($.line_description)),

    tag_throw: ($) => seq("@throw", $.line_description),

    tag_todo: ($) => seq("@todo", $.line_description),

    tag_type: ($) =>
      seq("@type", seq($.type_name, repeat(seq("|", $.type_name)))),

    tag_return: ($) =>
      seq(
        choice("@return", "@returns"),
        optional(prec(1, $.type)),
        optional($.line_description),
      ),

    tag_see: ($) => seq("@see", optional($.see_type), $.see_reference),

    tag_require: ($) => seq(
      choice("@require", "@requires"),
      optional($.see_type),  // Reuse see_type for {mixin}, {function}, etc.
      $.see_reference,       // Reuse see_reference for the item name
      optional($.tag_description),
    ),

    tag_example: ($) =>
      seq(
        "@example",
        optional($.example_language),
        optional($.tag_description),
        optional($.code_block),
      ),

    example_language: (_$) => token.immediate(/ [a-z]+/),

    // Code block: captures indented lines (including those with @ like @include, @if, etc.)
    // Each line must be either:
    // - Empty/whitespace only  
    // - Indented with 2+ spaces (code content, may start with @ like @include)
    // The block ends when we hit a line with @ at position 0-1 (a SassDoc tag)
    code_block: (_$) => token(prec(-1, 
      /(\n[ \t]*(\/\/\/[ \t]*)?([ \t]{2,}[^\n]*)?)+/
    )),

    type: ($) => seq("{", seq($.type_name, repeat(seq("|", $.type_name))), "}"),

    reference: (_$) => choice("mixin", "function", "variable", "placeholder"),

    type_name: (_$) => /\w+/,

    version: (_$) => /\d+\.\d+\.\d+/,

    variable_name: (_$) => /\$\w+/,

    default_value: (_$) => /\[[^\]]+\]/,

    line_description: (_$) => /[^\s@\n{][^@\n]*/,

    tag_description: ($) => seq("-", $.line_description),

    see_type: ($) => seq("{", $.reference, "}"),

    see_reference: (_$) =>
      choice(
        /\$[\w-]+/, // variable: $name
        /%[\w-]+/, // placeholder: %name
        /[\w-]+/, // mixin or function: name
      ),
  },
});
