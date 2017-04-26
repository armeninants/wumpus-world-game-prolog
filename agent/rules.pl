agent_location(Cell, 0) :- start(Cell), ! .
agent_location(Cell, T) :- agent_location_inf(Cell, T), ! .
agent_location([X,Y], T) :-
	T > 0,
	TP is T-1,
	agent_location([XP,YP], TP),
	(	action(forward, TP), !
	->	agent_orientation(Angle, TP),
		size(S),
		X is floor(XP + cos(Angle)),
		Y is floor(YP + sin(Angle))
	;	X = XP,
		Y = YP
	),
	assertz( agent_location_inf([X,Y], T) ).

%% ----------------------------------------------

agent_orientation(0, 0) :- start_orientation(Angle), ! .
agent_orientation(Angle, T) :- agent_orientation_inf(Angle, T), ! .
agent_orientation(Angle, T) :-
	T > 0,
	TP is T-1,
	action(Action, TP), !, 
	agent_orientation(AngleP, TP),
	(	Action == turnLeft
	->	Angle = (AngleP + 90) mod 360
	;	Action == turnRight
	->	Angle = (AngleP + 270) mod 360
	;	Angle == AngleP
	),
	assertz( agent_orientation_inf(Angle, T) ) .
	
%% ----------------------------------------------

adjacent([X1,Y1], [X2,Y2]) :-
	X1 = X2,
	(Y2 is Y1 - 1; Y2 is Y1 + 1),
	size(S),
	Y2 >= 1, Y2 =< S.
adjacent([X1,Y1], [X2,Y2]) :-
	Y1 = Y2,
	(X2 is X1 + 1; X2 is X1 - 1),
	size(S),
	X2 >= 1, X2 =< S.

%% ----------------------------------------------

visited(Cell, 0) :- start(Cell) .
visited(Cell, T) :- agent_location_inf(Cell, T), ! .
visited(Cell, T) :- 
	time(T),
	agent_location(Current, T),
	Cell == Current .

%% ----------------------------------------------

visited_cells(VisitedCells) :-
	findall(Cell, visited(Cell,_), VisitedCells) .
	
%% ----------------------------------------------

unvisited_cells(UnvisitedCells) :-
	findall(Cell, \+ visited(Cell,_), UnvisitedCells) .

%% ----------------------------------------------

breezy(Cell) :- 
	visited(Cell, T), !,
	breeze(yes, T).

smelly(Cell) :- 
	visited(Cell, T), !,
	stench(yes, T).

%% ----------------------------------------------

pit_free(Cell) :- pit_free_inf(Cell), ! .
pit_free(Cell) :- visited(Cell, _), ! .
pit_free(Cell) :-
	adjacent(Cell, Cell2),
	visited(Cell2, T),
	breeze(no, T), !,
	assertz( pit_free_inf(Cell) ).

%% ----------------------------------------------

pit(Cell) :- pit_inf(Cell), ! .
pit(Cell) :- 
	%% \+ visited(Cell, _),
	adjacent(Cell, Cell2),
	visited(Cell2, T),
	breeze(yes, T),
	forall(
		(	adjacent(Cell2, Cell3),
			Cell3 \== Cell
		),
		pit_free(Cell3)
	), 
	!,
	assertz( pit_inf(Cell) ).
%% ----------------------------------------------

%% wumpus_free if wumpus is dead, or if there is any adjacent visited with no stench
wumpus_free(Cell) :- wumpus_free_inf(Cell), ! .
wumpus_free(Cell) :- visited(Cell, _), ! .
wumpus_free(Cell) :- wumpus_health(dead), ! .
wumpus_free(Cell) :-
	adjacent(Cell, Cell2),
	visited(Cell2, T),
	stench(no, T), !,
	assertz( wumpus_free_inf(Cell) ).

%% ----------------------------------------------

wumpus_location(Cell) :- wumpus_location_inf(Cell), ! .
wumpus_location(Cell) :- 
	wumpus_health(alive),
	adjacent(Cell, Cell2),
	visited(Cell2, T),
	stench(yes, T),
	forall(
		(	adjacent(Cell2, Cell3),
			Cell3 \== Cell
		),
		wumpus_free(Cell3)
	),
	!,
	assertz( wumpus_location_inf(Cell) ).


%% ----------------------------------------------
possible_wumpus([Cell]) :-
	wumpus_location(Cell), !.
possible_wumpus(Cells) :-
	findall(Cell, \+ wumpus_free(Cell), Cells).

%% ----------------------------------------------

have_arrow(0) :- !.
have_arrow(T) :- \+ ( action(shoot, TP), TP < T ) .

%% ----------------------------------------------

scream_aftermath(no, 0) :- !.
scream_aftermath(no, T) :-
	TP is T-1,
	action(shoot, TP),
	have_arrow(TP),
	agent_location(Cell, TP),
	agent_orientation(Angle, TP),
	size(Size),
	infer_wumpus_free(Cell, Angle, Size).

scream_aftermath(yes, _) :-
	retract( wumpus_health(_) ),
	asserta( wumpus_health(dead) ) .

%% ----------------------------------------------

infer_wumpus_free([X,Y], Angle, Size) :-
	assertz( wumpus_free_inf([X,Y]) ),
	XN is floor(X + cos(Angle)),
	YN is floor(Y + sin(Angle)),
	(	0 =:= XN mod Size,
		0 =:= YN mod Size
	;	infer_wumpus_free([XN,YN], Angle, Size)
	).

%% ----------------------------------------------

ok(Cell) :-
	pit_free(Cell),
	wumpus_free(Cell).

safe(SafeCells, T) :-
	findall(Cell, ok(Cell, T), SafeCells).

%% ----------------------------------------------

wumpus_alive(0) .
wumpus_alive(T) :- 
	T > 0,
	\+ ( 
		action(shoot, TP), !, % shoot first time because of cut
		TP < T,
		agent_location([X,Y], TP),
		agent_orientation(Angle, TP),
		wumpus([WX,WY]),
		( Angle == right, Y == WY, X < WX
		; Angle == left,  Y == WY, X > WX
		; Angle == up,    X == WX, Y < WY
		; Angle == down,  X == WX, Y > WY
		)
	) .


