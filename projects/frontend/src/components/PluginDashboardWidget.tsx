import { PMBox, PMHeading, PMText, PMVStack } from '@packmind/ui';

/**
 * Dashboard widget component provided by the plugin.
 * This demonstrates how plugins can inject content into the dashboard.
 */
export function PluginDashboardWidget() {
  return (
    <PMBox
      p={6}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.secondary"
      bgColor="background.secondary"
    >
      <PMVStack gap={4} align="stretch">
        <PMHeading size="md">Plugin Dashboard Widget</PMHeading>
        <PMText>
          This widget is provided by the packmind-plugin. It demonstrates how
          plugins can inject content into the main application dashboard.
        </PMText>
        <PMText fontSize="sm">
          Plugins can add custom widgets, charts, or any other React components
          to enhance the dashboard experience.
        </PMText>
      </PMVStack>
    </PMBox>
  );
}

