type NumberType = 1[];
type type = NumberType;

type __CONTEXT = {
  [key in string]: {
    type: type;
    value: type;
  };
};
type VM<context extends __CONTEXT> = {
  context: context;
};

type haha = VM<{
  a: {
    type: NumberType;
    value: [1];
  };
}>;
