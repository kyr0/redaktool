import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import type { SettingsFieldProps } from "../types";

export const BaseUrlField = ({ form }: SettingsFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="baseURL"
      render={({ field }) => (
        <FormItem>
          <FormLabel>🌐 Basis-URL (optional):</FormLabel>
          <FormControl>
            <Input
              className=""
              placeholder={"Abweichende Basis-Adresse unter der die API erreichbar ist"}
              type="text"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Die Basis-URL kann verwendet werden, um ein anderes Hosting zu verwenden. z.B. On-Premise/Lokales Hosting und im Falle des OpenAI-Providers jeglicher alternative KI-Anbieter, der die Standard Chat Completion API unterstützt.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}