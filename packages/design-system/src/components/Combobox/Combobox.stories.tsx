import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { Field } from "../Field/Field";
import { Button } from "../Button/Button";
import { Combobox } from "./Combobox";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";
const options = [
  {value:"sp",label:"São Paulo",description:"São Paulo, Brazil"},
  {value:"lisbon",label:"Lisbon",description:"Portugal"},
  {value:"rio",label:"Rio de Janeiro",description:"Brazil"},
  {value:"santa-br",label:"Santa Maria",description:"Brazil"},
  {value:"santa-pt",label:"Santa Maria",description:"Portugal"},
  {value:"curitiba",label:"Curitiba",disabled:true},
];
const meta = {
  title:"Components/Forms/Combobox",id:"fields-combobox",component:Combobox,tags:["test"],parameters:{layout:"fullscreen"},
  args:{options,label:"City",clearLabel:"Clear city",closeLabel:"Close city picker",emptyLabel:"No matching cities",placeholder:"Search for a city",size:"md",appearance:"outlined"},
  argTypes:{size:{control:"select",options:["sm","md","lg"]},appearance:{control:"select",options:["outlined","soft","ghost"]},width:{control:"inline-radio",options:["hug","fill"]},onValueChange:{control:false}},
  render:args=><FoundationStoryPage title="Combobox" description="Type to filter, then select a city. Only selection changes the value."><Field label={args.label}>{({controlProps})=><Combobox {...args} {...controlProps}/>}</Field><Button intent="neutral" variant="ghost">Next field</Button></FoundationStoryPage>,
} satisfies Meta<typeof Combobox>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Playground:Story={
  parameters: {
    figma: {
      label: "Combobox in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8497-231",
    },
  },
  play:async({canvasElement})=>{
  const c=within(canvasElement);const input=c.getByRole("combobox");
  const frame=input.parentElement as HTMLElement;
  const restPaint=getComputedStyle(frame).backgroundColor;
  const openPaint=resolvedBackground(frame,"--color-surface-neutral-subtle-pressed");
  await userEvent.click(input);
  await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
  const panel = c.getByRole("dialog");
  await userEvent.hover(panel);
  await waitFor(() => expect(getComputedStyle(frame).backgroundColor).toBe(openPaint));
  const search = panel.dataset.presentation === "sheet" ? within(panel).getByRole("combobox") : input;
  await userEvent.clear(search);
  await userEvent.type(search,"sao");
  await waitFor(() => expect(c.getAllByRole("option")).toHaveLength(1));await userEvent.keyboard("{Enter}");await expect(input).toHaveValue("São Paulo");await expect(input).toHaveAttribute("aria-expanded","false");
  await userEvent.click(c.getByRole("button",{name:"Next field"}));
  await waitFor(() => expect(getComputedStyle(frame).backgroundColor).toBe(restPaint));
}};
export const Small:Story={args:{size:"sm"}};
export const Large:Story={args:{size:"lg"}};
export const Appearances:Story={render:args=><FoundationStoryPage title="Appearances" description="Shared field appearances and content sizing."><FoundationSpecimenGrid>{(["outlined","soft","ghost"] as const).map(appearance=><FoundationStorySection key={appearance} title={appearance}><Combobox {...args} appearance={appearance} defaultValue="sp"/></FoundationStorySection>)}</FoundationSpecimenGrid></FoundationStoryPage>};
export const States:Story={render:args=><FoundationStoryPage title="States" description="Existing field validation and availability states."><FoundationSpecimenGrid>{(["disabled","readOnly","loading"] as const).map(state=><FoundationStorySection key={state} title={state}><Combobox {...args} defaultValue="sp" {...{[state]:true}}/></FoundationStorySection>)}<Field label="Required city" error="Choose a city">{({controlProps})=><Combobox {...args} {...controlProps} required validationState="invalid"/>}</Field><Combobox {...args} options={[]} label="No cities available"/></FoundationSpecimenGrid></FoundationStoryPage>};
export const LongCopy:Story={args:{label:"Cidade de atendimento",clearLabel:"Limpar cidade",closeLabel:"Fechar cidades",emptyLabel:"Nenhuma cidade encontrada",options:[{value:"long",label:"São José do Vale do Rio Preto — Região Metropolitana",description:"Escolha a cidade de atendimento no estado do Rio de Janeiro"},...options],defaultValue:"long"}};
export const Form:Story={render:args=><FoundationStoryPage title="Form" description="Committed city participates in native submission and reset."><form><Combobox {...args} name="city" required defaultValue="sp"/><Button type="reset" intent="neutral" variant="secondary">Reset</Button></form></FoundationStoryPage>};
