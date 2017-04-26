%% clear_screen/0
clear_screen :- write('\e[H\e[2J').
%% cls :- put(27), put("["), put("2"), put("J").


%% only_numbers/2
only_numbers([], []).
only_numbers([X|T], [X|R]) :-
	integer(X), !,
	only_numbers(T, R).
only_numbers([_|T], R) :-
	only_numbers(T, R).

%% cursor/2
%% Position the cursor at (X,Y) on the screen
cursor(X,Y) :-
	put(27), put(91),
	write(Y),
	put(59),
	write(X),
	put(72) .

%% ==============================================

ascii_fg_color(black, 30).
ascii_fg_color(red, 31).
ascii_fg_color(green, 32).
ascii_fg_color(yellow, 33).
ascii_fg_color(blue, 34).
ascii_fg_color(magenta, 35).
ascii_fg_color(purple, 35).
ascii_fg_color(cyan, 36).
ascii_fg_color(lightgray, 37).
ascii_fg_color(darkgray, 90).
ascii_fg_color(lightred, 91).
ascii_fg_color(lightgreen, 92).
ascii_fg_color(lightyellow, 93).
ascii_fg_color(lightblue, 94).
ascii_fg_color(pink, 95).
ascii_fg_color(lightcyan, 96).
ascii_fg_color(white, 97).
ascii_fg_color(_, 39).

ascii_bg_color(black, 40).
ascii_bg_color(red, 41).
ascii_bg_color(green, 42).
ascii_bg_color(yellow, 43).
ascii_bg_color(blue, 44).
ascii_bg_color(purple, 45).
ascii_bg_color(cyan, 46).
ascii_bg_color(lightgray, 47). 
ascii_bg_color(darkgray, 100). 
ascii_bg_color(lightred, 101).
ascii_bg_color(lightgreen, 102). 
ascii_bg_color(lightyellow, 103).
ascii_bg_color(lightblue, 104).
ascii_bg_color(pink, 105). 
ascii_bg_color(lightcyan, 106).
ascii_bg_color(white, 107).
ascii_bg_color(_, 49).

chalk(FgColor, BgColor, Text) :-
	ascii_fg_color(FgColor, FgCode),
	ascii_bg_color(BgColor, BgCode),
	format('\e[0;~d;~dm', [FgCode, BgCode]),
	write(Text),
	write('\e[0m').

chalk(FgColor, BgColor, Format, Values) :-
	ascii_fg_color(FgColor, FgCode),
	ascii_bg_color(BgColor, BgCode),
	format('\e[0;~d;~dm', [FgCode, BgCode]),
	format(Format, Values),
	write('\e[0m').

set_bg(Color) :-
	ascii_bg_color(Color, Code),
	format('\e[28;~dm', [Code]).

clear_bg :- write('\e[0m').

%% ==============================================

assertzOnce(Fact) :-
	\+(Fact), !,
	assertz(Fact).
assertzOnce(_).

assertaOnce(Fact) :-
	\+(Fact), !,
	asserta(Fact).
assertaOnce(_).