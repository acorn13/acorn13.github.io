
/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                             /* skip whitespace */
/\/[^\n]*                      /* skip single line of comments */
/\*(([^*]\/)|[^/])*\*\/    /* skip multiline comments */

"function"            return 'function'
"for"                 return 'for'
"if"                  return 'if'
"while"               return 'while'
"var"                 return 'var'
"false"               return 'false'
"true"                return 'true'
"null"                return 'null'
"this"                return 'this'
"new"                 return 'new'
"delete"              return 'delete'
"continue"            return 'continue'
"break"               return 'break'
"return"              return 'return'
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
\"(\\.|[^\\"])*\"     return 'STRING'
\'(\\.|[^\\'])*\'     return 'STRING'
\w[\w\d_]*            return 'IDENTIFIER'
"||"                  return '||'
"&&"                  return '&&'
"<<"                  return 'SHIFT_OPERATOR'
">>"                  return 'SHIFT_OPERATOR'
"++"                  return 'INCREMENT_OPERATOR'
"--"                  return 'INCREMENT_OPERATOR'
"="                   return '='
"+="                  return '+='
"-="                  return '-='
"<"                   return 'RELATIONAL_OPERATOR'
">"                   return 'RELATIONAL_OPERATOR'
"<="                  return 'RELATIONAL_OPERATOR'
">="                  return 'RELATIONAL_OPERATOR'
"=="                  return 'EQUALITY_OPERATOR'
"==="                 return 'EQUALITY_OPERATOR'
"!="                  return 'EQUALITY_OPERATOR'
"!=="                 return 'EQUALITY_OPERATOR'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"!"                   return '!'
"%"                   return '%'
"."                   return '.'
"("                   return '('
")"                   return ')'
"["                   return '['
"]"                   return ']'
"{"                   return '{'
"}"                   return '}'
","                   return ','
"?"                   return '?'
":"                   return ':'
"PI"                  return 'PI'
"E"                   return 'E'
";"                   return ';'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

/* based on http://hepunx.rl.ac.uk/~adye/jsspec11/llr.htm */

%left '+' '-'
%left '*' '/' '%'
%right '^' '|' '&'

%start Program

%% /* language grammar */
Program
    : 'EOF'
        { return {elements: []} }
    | Elements 'EOF'
        { return {elements: $1} }
    ;

Elements
    : Element
        { $$ = [$1] }
    | Elements Element
        { $$ = [...$1, $2] }
    ;

Element
    : 'function' 'IDENTIFIER' '(' ParameterList ')' CompoundStatement
        { $$ = {type: 'function', id: $2, parameters: $4, ...$6} }
    | 'function' 'IDENTIFIER' '(' ')' CompoundStatement
        { $$ = {type: 'function', id: $2, parameters: [], ...$5} }
    | Statement
        { $$ = $1 }
    ;

ParameterList
    : 'IDENTIFIER'
        { $$ = [$1] }
    | 'IDENTIFIER' ',' ParameterList
        { $$ = [$1, ...$3] }
    ;

CompoundStatement
    : '{' '}'
        { $$ = {statements: []} }
    | '{' Statements '}'
        { $$ = {statements: $2} }
    ;

Statements
    : Statement
        { $$ = [$1] }
    | Statement Statements
        { $$ = [$1, ...$2] }
    ;

Statement
    : ';'
        { $$ = null }
    | 'if' ConditionExpressions Statement
        { $$ = {type: 'ifelse', conditionExpressions: $2, trueStatement: $3} }
    | 'if' ConditionExpressions Statement 'else' Statement
        { $$ = {type: 'ifelse', conditionExpressions: $2, trueStatement: $3, falseStatement: $5} }
    | 'while' ConditionExpressions Statement
        { $$ = {type: 'while', conditionExpressions: $2, statement: $3} }
    | 'for' '(' ';' AssignmentExpressions ';' AssignmentExpressions ')' Statement
        { $$ = {type: 'for', conditionExpressions: $4, incrementExpressions: $6, statement: $8} }
    | 'for' '(' ';' AssignmentExpressions ';' ')' Statement
        { $$ = {type: 'for', conditionExpressions: $4, statement: $7} }
    | 'for' '(' VariablesOrAssignmentExpressions ';' AssignmentExpressions ';' AssignmentExpressions ')' Statement
        { $$ = {type: 'for', variablesOrExpressions: $3, conditionExpressions: $5, incrementExpressions: $7, statement: $9} }
    | 'for' '(' VariablesOrAssignmentExpressions ';' AssignmentExpressions ';' ')' Statement
        { $$ = {type: 'for', variablesOrExpressions: $3, conditionExpressions: $5, statement: $8} }
    | 'for' '(' VariablesOrAssignmentExpressions 'in' AssignmentExpressions ')' Statement
        { $$ = {type: 'forin', variablesOrExpressions: $3, iterableExpressions: $5, statement: $7} }
    | 'break' ';'
        { $$ = {type: 'break'} }
    | 'continue' ';'
        { $$ = {type: 'continue'} }
    | 'return' ';'
        { $$ = {type: 'return'} }
    | 'return' AssignmentExpressions ';'
        { $$ = {type: 'return', expressions: $2} }
    | CompoundStatement
        { $$ = $1 }
    | VariablesOrAssignmentExpressions ';'
        { $$ = $1 }
    ;

ConditionExpressions
    : '(' AssignmentExpressions ')'
        { $$ = $2 }
    ;

VariablesOrAssignmentExpressions
    : 'var' Variables
        { $$ = {variables: $2} }
    | AssignmentExpressions
        { $$ = {expressions: $1} }
    ;

Variables
    : Variable
        { $$ = [$1] }
    | Variable ',' Variables
        { $$ = [$1, ...$3] }
    ;

Variable
    : 'IDENTIFIER'
        { $$ = {type: 'scopedAssignment', id: $1} }
    | 'IDENTIFIER' '=' AssignmentExpression
        { $$ = {type: 'scopedAssignment', id: $1, valueExpression: $3} }
    ;

AssignmentExpressions
    : AssignmentExpression
        { $$ = [$1] }
    | AssignmentExpression ',' AssignmentExpressions
        { $$ = [$1, ...$3] }
    ;

AssignmentExpression
    : ConditionalExpression
        { $$ = $1 }
    | AssignableExpression AssignmentOperator AssignmentExpression
        { $$ = {type: 'assignment', targetExpression: $1, assignmentOperator: $2, valueExpression: $3} }
    ;

ConditionalExpression
    : OrExpression
        { $$ = $1 }
    | OrExpression '?' AssignmentExpression ':' AssignmentExpression
        { $$ = {type: 'ifelse', conditionExpression: $1, trueStatment: $3, falseStatement: $5} }
    ;

OrExpression
    : AndExpression
        { $$ = $1 }
    | AndExpression '||' OrExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

AndExpression
    : BitwiseOrExpression
        { $$ = $1 }
    | BitwiseOrExpression '&&' AndExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

BitwiseOrExpression
    : BitwiseXorExpression
        { $$ = $1 }
    | BitwiseXorExpression '|' BitwiseOrExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

BitwiseXorExpression
    : BitwiseAndExpression
        { $$ = $1 }
    | BitwiseAndExpression '^' BitwiseXorExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

BitwiseAndExpression
    : EqualityExpression
        { $$ = $1 }
    | EqualityExpression '&' BitwiseAndExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

EqualityExpression
    : RelationalExpression
        { $$ = $1 }
    | RelationalExpression 'EQUALITY_OPERATOR' EqualityExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

RelationalExpression
    : ShiftExpression
        { $$ = $1 }
    | RelationalExpression 'RELATIONAL_OPERATOR' ShiftExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

ShiftExpression
    : AdditiveExpression
        { $$ = $1 }
    | AdditiveExpression 'SHIFT_OPERATOR' ShiftExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

AdditiveExpression
    : MultiplicativeExpression
        { $$ = $1 }
    | MultiplicativeExpression '+' AdditiveExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    | MultiplicativeExpression '-' AdditiveExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

MultiplicativeExpression
    : UnaryExpression
        { $$ = $1 }
    | UnaryExpression '*' MultiplicativeExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    | UnaryExpression '/' MultiplicativeExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    | UnaryExpression '%' MultiplicativeExpression
        { $$ = {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3} }
    ;

UnaryExpression
    : PrimaryExpression
        { $$ = $1 }
    | ReferenceableExpression
        { $$ = {type: 'evaluate', targetExpression: $1} }
    | '-' UnaryExpression
        { $$ = {type: 'unary', expression: $2, operator: $1} }
    | '!' UnaryExpression
        { $$ = {type: 'unary', expression: $2, operator: $1} }
    | 'INCREMENT_OPERATOR' AssignableExpression
        { $$ = {type: 'incrementBefore', targetExpression: $2, operator: $1} }
    | AssignableExpression 'INCREMENT_OPERATOR'
        { $$ = {type: 'incrementAfter', targetExpression: $1, operator: $2} }
 /*   | 'new' Constructor */
    | 'delete' AssignableExpression
        { $$ = {type: 'delete', targetExpression: $2} }
    ;
/*
Constructor
    : 'this' '.' ConstructorCall
    | ConstructorCall
    ;

ConstructorCall
    : 'IDENTIFIER'
    | 'IDENTIFIER' '(' ')'
    | 'IDENTIFIER' '(' ArgumentList ')'
    | 'IDENTIFIER' '.' ConstructorCall
    ; */
/*
MemberExpression
    : PrimaryExpression
        { $$ = $1 }
    | PrimaryExpression '.' MemberExpression
        { $$ = {type: 'readMember', targetExpression: $1, memberExpression: $3} }
    | PrimaryExpression '[' Expression ']'
        { $$ = {type: 'readKey', targetExpression: $1, keyExpression: $3} }
    | PrimaryExpression '(' ')'
        { $$ = {type: 'call', targetExpression: $1, arguments: []} }
    | PrimaryExpression '(' ArgumentList ')'
        { $$ = {type: 'call', targetExpression: $1, arguments: $3} }
    ;*/

ReferenceableExpression
    : AssignableExpression
        { $$ = $1 }
    | ReferenceableExpression '(' ')'
        { $$ = {type: 'call', targetExpression: $1, arguments: []} }
    | ReferenceableExpression '(' ArgumentList ')'
        { $$ = {type: 'call', targetExpression: $1, arguments: $3} }
    ;

AssignableExpression
    : 'IDENTIFIER'
        { $$ = {type: 'readVariable', id: $1} }
    | ReferenceableExpression '.' 'IDENTIFIER'
        { $$ = {type: 'readMember', targetExpression: $1, id: $3} }
    | ReferenceableExpression '[' AssignmentExpression ']'
        { $$ = {type: 'readKey', targetExpression: $1, keyExpression: $3} }
    ;

ArgumentList
    : AssignmentExpression
        { $$ = [$1] }
    | AssignmentExpression ',' ArgumentList
        { $$ = [$1, ...$3] }
    ;

PrimaryExpression
    : '(' AssignmentExpressions ')'
        { $$ = $2 }
    | 'NUMBER'
        { $$ = Number($1) }
    | 'STRING'
        /* strip quotes from strings */
        { $$ = $1.substring(1, $1.length - 1) }
    | 'false'
        { $$ = false }
    | 'true'
        { $$ = true }
    | 'null'
        { $$ = null }
    | 'this'
        { $$ = {id: $1} }
    ;

AssignmentOperator
    : '='
    | '-='
    | '+='
    ;

/* */
