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
    token(prec(2, /\/\/\/[ \t]?/)),         // /// prefix after code_line consumed \n
    token(prec(1, /\n/)),                   // Plain newline
  ],

  rules: {
    document: ($) => seq(
      // Optionally consume leading ///
      optional($._comment_marker),
      // Handle either:
      // - Indented code line (part of @example from previous comment)
      // - Normal sassdoc content (description + tags)
      choice(
        $._indented_code,  // Indented line = code from @example
        seq(optional($.description), repeat($.tag)),
      ),
    ),

    // Matches indented content (2+ spaces) - these are code lines from @example blocks
    // When parsing line-by-line, these appear as standalone documents
    _indented_code: (_) => /[ \t]{2,}[^\n]*/,

    // Hidden: matches /// at start (high precedence to beat _description_line)
    _comment_marker: (_) => token(prec(10, seq("///", /[ \t]?/))),

    // Description: one or more lines of text before any @ tag
    description: ($) => repeat1($._description_line),

    // A single line of description (doesn't start with @)
    _description_line: (_) => /[^@\s\n][^@\n]*/,
    tag: ($) =>
      choice(
        $.tag_param,
        $.tag_property,
        $.tag_return,
        $.tag_access,
        $.tag_alias,
        $.tag_author,
        $.tag_content,
        $.tag_deprecated,
        $.tag_group,
        $.tag_ignore,
        $.tag_link,
        $.tag_name,
        $.tag_output,
        $.tag_package,
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

    tag_alias: ($) => seq("@alias", $.alias_name),

    alias_name: (_$) => /[\w-]+/,

    tag_content: ($) => seq("@content", seq("[", $.line_description, "]")),

    tag_group: ($) => seq("@group", $.group_name),

    group_name: (_$) => /[\w-]+/,

    tag_deprecated: ($) => seq("@deprecated", $.line_description),

    tag_author: ($) => seq("@author", $.line_description),

    tag_ignore: ($) => seq("@ignore", $.line_description),

    tag_link: ($) => seq(
      choice("@link", "@source"),
      $.url,
      optional($.link_caption),
    ),

    url: (_$) => /https?:\/\/[^\s]+/,

    link_caption: (_$) => /[^\n]+/,

    tag_name: ($) => seq("@name", $.custom_name),

    custom_name: (_$) => /[^\n]+/,

    tag_output: ($) => seq(choice("@output", "@outputs"), $.line_description),

    tag_package: ($) => seq("@package", $.package_name),

    package_name: (_$) => /[\w-]+/,

    tag_since: ($) => seq("@since", $.version, optional($.line_description)),

    tag_throw: ($) => seq(choice("@throw", "@throws", "@exception"), $.line_description),

    tag_todo: ($) => seq("@todo", $.line_description),

    tag_type: ($) =>
      seq("@type", seq($.type_name, repeat(seq("|", $.type_name)))),

    // @property / @prop - documents map properties
    // Format: @prop {Type} name.path [default] - description
    tag_property: ($) => seq(
      choice("@property", "@prop"),
      optional($.type),
      $.property_name,
      optional($.default_value),
      optional($.tag_description),
    ),

    // Property name with dot notation for nested maps (e.g., base.default)
    property_name: (_$) => /[\w-]+(\.[\w-]+)*/,

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
    code_block: ($) => repeat1($.code_line),

    // A single line of example code - content after /// with 2+ spaces of indentation
    // Includes trailing \n so injected parsers (e.g. SCSS) see line boundaries,
    // which is critical for single-line comments (//) to terminate correctly.
    // The \n is optional to handle the last line of a code block at EOF.
    code_line: (_$) => token(prec(3, /[ \t]{2,}[^\n]*\n?/)),

    type: ($) => seq("{", seq($.type_name, repeat(seq("|", $.type_name))), "}"),

    reference: (_$) => choice("mixin", "function", "variable", "placeholder"),

    type_name: (_$) => /\w+/,

    version: (_$) => /\d+\.\d+\.\d+/,

    variable_name: (_$) => /\$[\w-]+/,

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
