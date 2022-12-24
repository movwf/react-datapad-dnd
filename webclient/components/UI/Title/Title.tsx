import { Conditional } from "@core/react/conditional";
import { ReactChildren } from "@webclient/../core/src/react/types";

interface TitleProps {
  icon?: string;
  title: string;
  subtitle?: string;
  buttonGroup?: ReactChildren;
}

function Title(props: TitleProps) {
  return (
    <div className="mb-5 w-full flex flex-row justify-between">
      <div>
        <h1 className="text-4xl dark:text-white">
          <Conditional if={props.icon !== undefined}>
            <>{props.icon}</>
          </Conditional>
          {props.title}
        </h1>
        <Conditional if={props.subtitle !== undefined}>
          <h4>{props.subtitle}</h4>
        </Conditional>
      </div>
      {<Conditional if={!!props.buttonGroup}>{props.buttonGroup}</Conditional>}
    </div>
  );
}

export default Title;
