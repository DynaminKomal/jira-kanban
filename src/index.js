import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getAllProjects', async (req) => {
  try {
    const response = await api
      .asApp()
      .requestJira(
        route`/rest/api/2/project`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return { error: error.message };
  }
});

resolver.define('getAllIssues', async (req) => {
  try {
    let isSkip = true;
    let count = 0;
    let allIssues = [];

    while (isSkip) {
      const response = await api
        .asUser()
        .requestJira(
          route`/rest/api/2/search?jql=sprint in openSprints()&startAt=${count}&maxResults=100`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status}`);
      }

      const data = await response.json();
      if (data.issues.length === 0) {
        isSkip = false;
      } else {
        count += 100;
      }

      allIssues = allIssues.concat(data.issues);
    }

    const issuesData = allIssues
      .filter(item => item.fields.issuetype.name !== 'Epic' && item.fields.issuetype.name !== 'Story')
      .map(item => {
        const issueData = {
          id: item.id,
          key: item.key,
          summary: item.fields.summary,
          issuetype: {
            iconUrl: item.fields.issuetype.iconUrl,
            name: item.fields.issuetype.name,
          },
          epicName: item.fields.parent?.fields?.summary || '',
          description: item.fields.description,
          assignee: item.fields.assignee
            ? {
              accountId: item.fields.assignee.accountId,
              assigneeUrl: item.fields.assignee.avatarUrls['24x24'],
              displayName: item.fields.assignee.displayName,
            }
            : {},
          startDate: item.fields.customfield_10015 || null,
          dueDate: item.fields.dueDate,
          project: {
            project_id: item.fields.project.id,
            project_key: item.fields.project.key,
            project_url: item.fields.project.avatarUrls['24x24'],
          },
          priority: {
            priorityUrl: item.fields.priority?.iconUrl || '',
            priorityName: item.fields.priority?.name || '',
          },
          status: item.fields.status.name,
          actualTime: item.fields.timespent,
          originalTime: item.fields.aggregatetimeoriginalestimate,
          labels: item.fields.labels?.map(label => label.toUpperCase()) || [],
          sprint: item.fields.customfield_10020 || '',
          prior: item.fields.customfield_10055 || 0
        };
        return issueData;
      });

    return issuesData;
  } catch (error) {
    console.error('Error in getAllIssues:', error);
    return { error: error.message };
  }
});

resolver.define('updateCustomField', async (req) => {
  try {
    let isSkip = true;
    let count = 0;
    let allIssues = [];

    while (isSkip) {
      const response = await api
        .asUser()
        .requestJira(
          route`/rest/api/2/search?jql=sprint in openSprints()&startAt=${count}&maxResults=100`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status}`);
      }

      const data = await response.json();
      if (data.issues.length === 0) {
        isSkip = false;
      } else {
        count += 100;
      }

      allIssues = allIssues.concat(data.issues);
    }

    const userTaskCounts = {};

    for (const item of allIssues) {
      const issueData = {
        id: item.id,
        key: item.key,
        summary: item.fields.summary,
        issuetype: {
          iconUrl: item.fields.issuetype.iconUrl,
          name: item.fields.issuetype.name,
        },
        epicName: item.fields.parent?.fields?.summary || '',
        description: item.fields.description,
        assignee: item.fields.assignee
          ? {
            accountId: item.fields.assignee.accountId,
            assigneeUrl: item.fields.assignee.avatarUrls['24x24'],
            displayName: item.fields.assignee.displayName,
          }
          : {},
        startDate: item.fields.customfield_10015 || null,
        dueDate: item.fields.dueDate,
        project: {
          project_id: item.fields.project.id,
          project_key: item.fields.project.key,
          project_url: item.fields.project.avatarUrls['24x24'],
        },
        priority: {
          priorityUrl: item.fields.priority?.iconUrl || '',
          priorityName: item.fields.priority?.name || '',
        },
        status: item.fields.status.name,
        actualTime: item.fields.timespent,
        originalTime: item.fields.aggregatetimeoriginalestimate,
        labels: item.fields.labels?.map(label => label.toUpperCase()) || [],
        sprint: item.fields.customfield_10020 || '',
        prior: item.fields.customfield_10055 || 0,
      };

      if (issueData.assignee.accountId) {
        if (!issueData.startDate) {
          issueData.prior = 0;
        } else {
          const startDate = new Date(issueData.startDate);
          const dayOfWeek = startDate.getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const userId = issueData.assignee.accountId;
            if (!userTaskCounts[userId]) {
              userTaskCounts[userId] = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0 };
            }

            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const dayName = daysOfWeek[dayOfWeek - 1];

            userTaskCounts[userId][dayName] += 1;
            issueData.prior = userTaskCounts[userId][dayName];
          } else {
            issueData.prior = 0;
          }
        }

        // Check if customfield_10055 has a value
        if (issueData.prior !== 0 && !item.fields.customfield_10055) {
          // Only update if customfield_10055 is not already set
          const updateResponse = await api.asUser().requestJira(
            route`/rest/api/2/issue/${issueData.key}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  customfield_10055: issueData.prior,
                },
              }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update issue ${issueData.key}: ${updateResponse.status}`);
          }
        }
      }
    }

    return "Issues updated successfully";
  } catch (err) {
    console.error('Error in updateIssue:', err);
    throw err;  // Re-throw error to propagate it
  }
});


resolver.define('updateCustomFieldRanked', async (req) => {
  try {
    const { allIssues } = req.payload;
    for (const [index, item] of allIssues.entries()) {

      if (!item.key) {
        console.error(`Skipping issue at index ${index}: Missing issue key`);
        continue;
      }

      const startDate = new Date();
      const dayOfWeek = startDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const updateResponse = await api.asUser().requestJira(
          route`/rest/api/2/issue/${item.key}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                customfield_10055: index + 1,
              },
            }),
          }
        );

        if (!updateResponse.ok) {
          console.error(`Failed to update issue ${item.key}: ${updateResponse.status}`);
          throw new Error(`Failed to update issue ${item.key}: ${updateResponse.status}`);
        }
      }
    }

    return 'Issues updated successfully';
  } catch (err) {
    console.error('Error in updateCustomFieldRanked:', err);
    throw err;
  }
});





resolver.define('updateIssue', async (req) => {
  try {
    const { date, issueId } = req.payload;
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/2/issue/${issueId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            customfield_10015: date,
            customfield_10055: 0,
          },
        }),
      });

    if (!response.ok) {
      throw new Error(`Failed to update issue: ${response.status}`);
    }

  } catch (err) {
    console.error('Error in updateIssue:', err);
  }
});

resolver.define('updateIssueTime', async (req) => {
  try {
    const { time, id } = req.payload;
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/2/issue/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            timetracking: {
              originalEstimate: time,
            },
          },
        }),
      });

    if (!response.ok) {
      throw new Error(`Failed to update issue time: ${response.status}`);
    }

  } catch (err) {
    console.error('Error in updateIssueTime:', err);
  }
});

resolver.define('setDailyWorkingHours', async (req) => {
  try {
    await storage.set('daily_working_hours', [
      { name: "Komal", login_time: "8:30 am", logout_time: "5:30 pm" },
      { name: "Sona Prj", login_time: "9:00 am", logout_time: "6:00 pm" }
    ]);
    return "Daily working hours stored successfully";
  } catch (error) {
    console.error('Error in setDailyWorkingHours:', error);
    return { error: error.message };
  }
});

resolver.define('getDailyWorkingHours', async (req) => {
  try {
    const workingHours = await storage.get('daily_working_hours');
    if (workingHours) {
      return workingHours;
    } else {
      return { message: 'No daily working hours found in storage' };
    }
  } catch (error) {
    console.error('Error retrieving daily working hours:', error);
    return { error: error.message };
  }
});

export const handler = resolver.getDefinitions();
