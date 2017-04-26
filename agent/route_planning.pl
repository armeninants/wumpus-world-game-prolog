
% plan_route(+Current, +Goals, +Allowed, -Plan)
plan_route(_, [], _, []).
plan_route(Current, Goals, Allowed, Plan) :-
	make_route_problem(Current, Goals, Allowed),
	astar(Current, successor, goal_test, heuristic, Path, cell_equal),
	%% trace,
	path2actions(Path, Plan).

%% ----------------------------------------------

% make_route_problem(+Current, +Goals, +Allowed)
% Returns a search problem Problem
make_route_problem(Current, Goals, Allowed) :-
	retractall(start_location(_)),
	asserta(start_location(Current)),
	retractall(goal_locations(_)),
	asserta(goal_locations(Goals)),
	retractall(allowed_locations(_)),
	asserta(allowed_locations(Allowed)).

goal_test(Goal) :-
	goal_locations(Goals),
	member(Goal, Goals).

successor(Cell, Successors) :-
	allowed_locations(Allowed),
	findall(
		[1, Adjacent],
		(	member(Adjacent, Allowed),
			adjacent(Cell, Adjacent)
		),
		Successors
	).

heuristic([X,Y], Hval) :-
	goal_locations(Goals),
	findall(
		ManhattanDist,
		(	member(Goal, Goals),
			[X1,Y1] = Goal,
			ManhattanDist is abs(X-X1) + abs(Y-Y1)
		),
		MDistList
	),
	min_list(MDistList, Hval).

cell_equal(C,C).

%% ----------------------------------------------

% path2actions(+Path, -Actions)
path2actions(Path, Actions) :- 
	%% time(T),
	%% facing(Orient, T),
	path2actions(Path, 0, Actions).
	
path2actions([], _, []).
path2actions([_], _, []).
path2actions([Current,Next|Path], Orient, [Action|Actions]) :-
	[X1,Y1] = Current,
	[X2,Y2] = Next,
	DX is X2 - X1,
	DY is Y2 - Y1,
	Angle is atan2(DY, DX) * (180.0 / pi),
	nearest_orientation(Angle, Orient2),
	direction_action(Orient, Orient2, Action),
	apply_action(Orient, Action, Orient3),
	(	Action == forward
	->	path2actions([Next|Path], Orient3, Actions)
	;	path2actions([Current,Next|Path], Orient3, Actions)
	).

% nearest_orientation(Angle,Orient):  Orient is the nearest orientation
%   (0,90,180,270) to Angle (in degrees), where 0 <= Angle < 360.

nearest_orientation(Angle,0) :-
  ( Angle =< 45 ;
    Angle > 315 ),
  !.
nearest_orientation(Angle,90) :-
  Angle > 45,
  Angle =< 135,
  !.
nearest_orientation(Angle,180) :-
  Angle > 135,
  Angle =< 225,
  !.
nearest_orientation(_,270).


% direction_action(Orient1,Orient2,Action): Action = goforward if
%   Orient1=Orient2.  Otherwise, Action is turnleft or turnright
%   according to the difference between Orient1 and Orient2.

direction_action(270,0,turnLeft) :- !.
direction_action(0,270,turnRight) :- !.
direction_action(Orient1, Orient2, turnLeft) :-
  Orient1 < Orient2,
  !.
direction_action(Orient1, Orient2, turnRight) :-
  Orient1 > Orient2,
  !.
direction_action(_, _, forward).


apply_action(Orient, forward, Orient).
apply_action(Orient, turnLeft, NewOrient) :-
	NewOrient is Orient+90 mod 360.
apply_action(Orient, turnRight, NewOrient) :-
	NewOrient is Orient-90 mod 360.

%% ----------------------------------------------

plan_shot(Current, PossibleTargets, Allowed, Plan) :-
	grid_of(PossibleTargets, Grid1),
	plan_route(Current, Grid1, Allowed, Path)
	path2actions(Path, Plan0),
	last_element(Path, ShootFrom),
	grid_of(ShootFrom, Grid2),
	intersection(Grid1, PossibleTargets, SomeTargets),
	random_element_from(SomeTargets, Target),
	turn_towards(Current, Target, Actions0),
	append([Plan0, Actions0, [shoot]], Plan).

