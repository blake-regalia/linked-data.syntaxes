# Syntax highlighting definitions for various Linked Data languages

Each syntax highlighter reflects a complete implementation of the grammar specification for its language. This provides highly-specific scoping and instant feedback on malformed code (i.e., invalid or misplaced tokens are easily identified).

### Install:
Available on [Package Control](https://packagecontrol.io/packages/LinkedData) as `LinkedData` .

### Activating the Light Color Scheme
The package ships with two color schemes which are designed specifically for the detailed scopes that the syntax highlighting definitions create. By default, the package uses the [Macaron Dark](#macaron-dark) color scheme. If you prefer to use [Macaron Light](#macaron-light), you'll need to create a settings file to override the syntaxes:

Create a new file in your Sublime Text 3 Packages directory: `Packages/User/LinkedData.sublime-settings`
```json
// These settings will override both User and Default settings for the specific LinkedData syntaxes
{
	"color_scheme": "Packages/LinkedData/macaron-light.sublime-color-scheme"
}
```

Then, create a symbolic link to this file for each syntax (shown here are terminal commands to be run from the [user packages directory](https://stackoverflow.com/a/49967132/1641160) for \*nix systems):
```bash
ln -s LinkedData.sublime-settings n-triples.sublime-settings
ln -s LinkedData.sublime-settings n-quads.sublime-settings
ln -s LinkedData.sublime-settings turtle.sublime-settings
ln -s LinkedData.sublime-settings trig.sublime-settings
ln -s LinkedData.sublime-settings notation3.sublime-settings
ln -s LinkedData.sublime-settings sparql.sublime-settings
```

This will override the default color scheme when any of these syntaxes are loaded in the current view.


#### Features:
 - Highly-specific scoping allows for very detailed color schemes.
 - Malformed syntax detection. Expected token(s) are inspectable via scope name.
 - Auto-completion and validation for prefix mappings registered on [prefix.cc](http://prefix.cc).

#### Currently supported languages:
 - SPARQL 1.1
 - Turtle (TTL)
 - TriG
 - N-Triples (NT)
 - N-Quads (NQ)
 - Notation3 (N3)

#### Currently supported platforms:
 - Sublime Text 3

#### Currently supported color themes:
 - Macaron Dark
 - Macaron Light (in beta)

#### *Planned langauage support*:
 - ShExC
 - RDFa
 - JSON-LD

#### *Planned platform support*:
 - Atom
 - CodeMirror
 - Emacs
 - minted (LaTeX)
 - ~Ace~

#### *Planned color theme support*
 - *Suggestions?*

---

### Previews:

#### Macaron Dark

##### Turtle:
![Turtle Preview](doc/preview/macaron-dark/turtle.png)

##### SPARQL:
![SPARQL Preview](doc/preview/macaron-dark/sparql.png)

#### Macaron Light

##### Turtle:
![Turtle Preview](doc/preview/macaron-light/turtle.png)

##### SPARQL:
![SPARQL Preview](doc/preview/macaron-light/sparql.png)

