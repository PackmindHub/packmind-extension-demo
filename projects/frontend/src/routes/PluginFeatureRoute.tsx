import { useParams } from "react-router";
import { PMPage, PMBox, PMText } from "@packmind/ui";
import type { LoaderFunctionArgs } from "react-router";

export async function pluginFeatureLoader({ params }: LoaderFunctionArgs) {
  // Load data for the route
  return { orgSlug: params["orgSlug"] };
}

export default function PluginFeatureRoute() {
  const { orgSlug } = useParams();

  return (
    <PMPage
      title="Plugin Feature"
      subtitle="This is a test route from the plugin"
    >
      <PMBox p={4}>
        <PMText>Hello from plugin! Organization: {orgSlug}</PMText>
        <PMBox mt={2}>
          <PMText>
            This route was loaded dynamically from the plugin bundle.
          </PMText>
        </PMBox>
      </PMBox>
    </PMPage>
  );
}
