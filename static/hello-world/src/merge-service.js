/**
 * mergeFlow.js
 * JavaScript port of the C# MergeJson / helper functions.
 * Behaviour is identical to the original C# code.
 */

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Finds the highest numeric Id value across all items in FlowItems_One.
 * Equivalent to FindHighestPossibleLogicItemInflowOne(JArray).
 *
 * @param {Array<Object>} flowItemsOne  – parsed array of flow-item objects
 * @returns {number}  highest Id found (or Number.MIN_SAFE_INTEGER if none)
 */
function findHighestPossibleLogicItemInflowOne(flowItemsOne) {
  let maxId = Number.MIN_SAFE_INTEGER;

  for (const item of flowItemsOne) {
    if (item != null && item["Id"] != null) {
      const currentId = parseInt(item["Id"], 10);
      if (!isNaN(currentId) && currentId > maxId) {
        maxId = currentId;
      }
    }
  }

  console.log(`The highest Id is: ${maxId}`);
  return maxId;
}

/**
 * Offsets every Id in FlowItems_Two by MaxId.
 * For Container items also offsets each entry in Items[].
 * For StateTransitioner items offsets TargetStateId by StateCount (when > 0).
 * Mutates and returns the same array.
 * Equivalent to AlteringLogicItemsInflowTwo(JArray, long, int).
 *
 * @param {Array<Object>} flowItemsTwo
 * @param {number} maxId
 * @param {number} stateCount
 * @returns {Array<Object>}
 */
function alteringLogicItemsInflowTwo(flowItemsTwo, maxId, stateCount) {
  for (const item of flowItemsTwo) {
    if (item["Id"] != null) {
      const currentId = parseInt(item["Id"], 10);
      item["Id"] = (isNaN(currentId) ? 0 : currentId) + maxId;
    }

    const typ = item["$type"] ?? null;

    if (typ === "Container") {
      const containerItems = item["Items"];
      if (Array.isArray(containerItems)) {
        for (let index = 0; index < containerItems.length; index++) {
          item["Items"][index] = parseInt(item["Items"][index], 10) + maxId;
        }
      }
    } else if (typ === "StateTransitioner") {
      if (stateCount > 0) {
        item["TargetStateId"] = parseInt(item["TargetStateId"], 10) + stateCount;
      }
    }
  }

  return flowItemsTwo;
}

/**
 * Offsets every entry in state.Items[] by MaxId for all states.
 * Mutates and returns the same object.
 * Equivalent to AlteringFlowStateItemsInTwo(FlowStatesDTO, int).
 *
 * @param {{ FlowStates: Array<{ Items: number[] }> }} flowStates
 * @param {number} maxId
 * @returns {object}
 */
function alteringFlowStateItemsInTwo(flowStates, maxId) {
  for (const state of flowStates.FlowStates) {
    for (let i = 0; i < state.Items.length; i++) {
      state.Items[i] += maxId;
    }
  }
  return flowStates;
}

/**
 * Offsets every state.StateId by OtherStateCount.
 * Mutates and returns the same object.
 * Equivalent to AlteringFlowStateIdsInTwo(FlowStatesDTO, int).
 *
 * @param {{ FlowStates: Array<{ StateId: number }> }} flowStates
 * @param {number} otherStateCount
 * @returns {object}
 */
function alteringFlowStateIdsInTwo(flowStates, otherStateCount) {
  for (const state of flowStates.FlowStates) {
    state.StateId += otherStateCount;
  }
  return flowStates;
}

/**
 * Offsets every entry in section.FlowItems[] by MaxId for all sections.
 * Mutates and returns the same object.
 * Equivalent to AlteringFlowSectionItemsInTwo(FlowSectionDTO, int).
 *
 * @param {{ FlowSections: Array<{ FlowItems: number[] }> }} flowSections
 * @param {number} maxId
 * @returns {object}
 */
function alteringFlowSectionItemsInTwo(flowSections, maxId) {
  for (const section of flowSections.FlowSections) {
    for (let i = 0; i < section.FlowItems.length; i++) {
      section.FlowItems[i] += maxId;
    }
  }
  return flowSections;
}

/**
 * Offsets every section.Id by OtherSectionCount.
 * Mutates and returns the same object.
 * Equivalent to AlteringFlowSectionIdsInTwo(FlowSectionDTO, int).
 *
 * @param {{ FlowSections: Array<{ Id: number }> }} flowSections
 * @param {number} otherSectionCount
 * @returns {object}
 */
function alteringFlowSectionIdsInTwo(flowSections, otherSectionCount) {
  for (const section of flowSections.FlowSections) {
    section.Id += otherSectionCount;
  }
  return flowSections;
}

/**
 * Offsets TriggerItemId and EventItemId in every EventTriggerLink by MaxId.
 * Mutates and returns the same object.
 * Equivalent to AlteringEventsAndTriggersInTwo(EventTriggerLinksDTO, int).
 *
 * @param {{ EventTriggerLinks: Array<{ TriggerItemId: number, EventItemId: number }> }} events
 * @param {number} maxId
 * @returns {object}
 */
function alteringEventsAndTriggersInTwo(events, maxId) {
  for (const item of events.EventTriggerLinks) {
    item.TriggerItemId += maxId;
    item.EventItemId += maxId;
  }
  return events;
}

// ---------------------------------------------------------------------------
// Public: mergeJson
// ---------------------------------------------------------------------------

/**
 * Merges two flow JSON strings into a single flow JSON string.
 *
 * The function accepts a `flowTemplate` string (the content of flow.txt in the
 * original C# project) because the browser / Node environment has no access to
 * the server's wwwroot folder.  Pass the template string directly.
 *
 * Equivalent to MergeJson(string json1, string json2).
 *
 * @param {string} json1          – first flow JSON string
 * @param {string} json2          – second flow JSON string
 * @param {string} flowTemplate   – contents of flow.txt (the base template)
 * @returns {string}  merged flow JSON string, or an error message
 */
function mergeJson(json1, json2, flowTemplate) {
  const t0 = performance.now();

  // Normalise line endings (mirrors .Replace("\r","").Replace("\n",""))
  json1 = json1.replace(/\r/g, "").replace(/\n/g, "");
  json2 = json2.replace(/\r/g, "").replace(/\n/g, "");

  let final = flowTemplate;

  // Parse both JSON strings into objects
  const jsonObj1 = JSON.parse(json1);
  const jsonObj2 = JSON.parse(json2);

  // ── Settings (from Flow 1) ────────────────────────────────────────────────
  const settings = JSON.parse(json1); // full object doubles as GeneralFlowSettings

  // ── Variables ────────────────────────────────────────────────────────────
  const variablesOne = jsonObj1["Variables"];
  const variablesTwo = jsonObj2["Variables"];

  if (!Array.isArray(variablesOne) || !Array.isArray(variablesTwo)) {
    return "Variables are not found in either of flows";
  }

  const finalVariables = [...variablesOne, ...variablesTwo];

  // ── FlowStates (part 1 – deserialise) ────────────────────────────────────
  // Deep-clone so mutations on _Two don't bleed into _One
  const flowStatesOne = JSON.parse(JSON.stringify({ FlowStates: jsonObj1["FlowStates"] ?? [] }));
  const flowStatesTwo = JSON.parse(JSON.stringify({ FlowStates: jsonObj2["FlowStates"] ?? [] }));

  if (!flowStatesOne || !flowStatesTwo) {
    return "FlowStates are not found in either of flows";
  }

  // ── FlowItems ─────────────────────────────────────────────────────────────
  const flowItemsOne = jsonObj1["FlowItems"];
  let flowItemsTwo = JSON.parse(JSON.stringify(jsonObj2["FlowItems"] ?? []));

  if (!Array.isArray(flowItemsOne) || !Array.isArray(flowItemsTwo)) {
    return "FlowItems are not found in either of flows";
  }

  const maxLogicItemId = findHighestPossibleLogicItemInflowOne(flowItemsOne);

  flowItemsTwo = alteringLogicItemsInflowTwo(
    flowItemsTwo,
    maxLogicItemId,
    flowStatesOne.FlowStates.length   // StateCount = count of states in flow 1
  );

  const finalFlowItems = [...flowItemsOne, ...flowItemsTwo];

  // ── FlowStates (part 2 – alter & merge) ───────────────────────────────────
  alteringFlowStateIdsInTwo(flowStatesTwo, flowStatesOne.FlowStates.length);
  alteringFlowStateItemsInTwo(flowStatesTwo, maxLogicItemId);
  flowStatesOne.FlowStates.push(...flowStatesTwo.FlowStates);
  const finalFlowStates = flowStatesOne;

  // ── FlowSections ──────────────────────────────────────────────────────────
  const flowSectionOne = JSON.parse(JSON.stringify({ FlowSections: jsonObj1["FlowSections"] ?? [] }));
  const flowSectionTwo = JSON.parse(JSON.stringify({ FlowSections: jsonObj2["FlowSections"] ?? [] }));

  if (!flowSectionOne || !flowSectionTwo) {
    return "FlowSection are not found in either of flows";
  }

  alteringFlowSectionIdsInTwo(flowSectionTwo, flowSectionOne.FlowSections.length);
  alteringFlowSectionItemsInTwo(flowSectionTwo, maxLogicItemId);
  flowSectionOne.FlowSections.push(...flowSectionTwo.FlowSections);
  const finalFlowSections = flowSectionOne;

  // ── EventTriggerLinks ─────────────────────────────────────────────────────
  const etlOne = JSON.parse(JSON.stringify({ EventTriggerLinks: jsonObj1["EventTriggerLinks"] ?? [] }));
  const etlTwo = JSON.parse(JSON.stringify({ EventTriggerLinks: jsonObj2["EventTriggerLinks"] ?? [] }));

  if (!etlOne || !etlTwo) {
    return "EventTriggerLinks are not found in either of flows";
  }

  alteringEventsAndTriggersInTwo(etlTwo, maxLogicItemId);
  etlOne.EventTriggerLinks.push(...etlTwo.EventTriggerLinks);
  const finalEventTriggerLinks = etlOne;

  // ── Template substitution ────────────────────────────────────────────────
  // Arrays
  final = final.replace("__Variables__",        JSON.stringify(finalVariables, null, 2));
  final = final.replace("__FlowItems__",         JSON.stringify(finalFlowItems, null, 2));
  final = final.replace("__FlowStates__",        JSON.stringify(finalFlowStates.FlowStates, null, 2));
  final = final.replace("__FlowSections__",      JSON.stringify(finalFlowSections.FlowSections, null, 2));
  final = final.replace("__EventTriggerLinks__", JSON.stringify(finalEventTriggerLinks.EventTriggerLinks, null, 2));

  // Integer settings
  final = final.replace("__SessionTimeoutInMinutes__", String(settings.SessionTimeoutInMinutes));
  final = final.replace("__InitialState__",            String(settings.InitialState));
  final = final.replace("__InitialCardholderState__",  String(settings.InitialCardholderState));

  // Boolean settings (lowercase, mirrors C# .ToString().ToLower())
  final = final.replace("__ExternalTelephony__",        String(!!settings.ExternalTelephony));
  final = final.replace("__UsesPostSessionScreen__",    String(!!settings.UsesPostSessionScreen));
  final = final.replace("__IsMarkdownEnabled__",        String(!!settings.IsMarkdownEnabled));
  final = final.replace("__AlternativeRenderingMode__", String(!!settings.AlternativeRenderingMode));
  final = final.replace("__SecureCallUponLinking__",    String(!!settings.SecureCallUponLinking));
  final = final.replace("__LinkIdEnabled__",            String(!!settings.LinkIdEnabled));

  // Nullable string settings
  const nullableStr = (val) => (val == null ? "null" : `"${val}"`);
  final = final.replace("__InitialDtmfFlowValue__", nullableStr(settings.InitialDtmfFlowValue));
  final = final.replace("__LinkIdPrefix__",          nullableStr(settings.LinkIdPrefix));
  final = final.replace("__Styling__",               nullableStr(settings.Styling));
  final = final.replace("__FrameAncestors__",        nullableStr(settings.FrameAncestors));
  final = final.replace("__FlowInterface__",         nullableStr(settings.FlowInterface));

  const elapsed = (performance.now() - t0).toFixed(2);
  console.log(`Elapsed Time: ${elapsed} ms`);

  return final;
}

// ---------------------------------------------------------------------------
// Exports (ESM / ES6 modules)
// ---------------------------------------------------------------------------
export {
  mergeJson,
  // exported for unit-testing
  findHighestPossibleLogicItemInflowOne,
  alteringLogicItemsInflowTwo,
  alteringFlowStateItemsInTwo,
  alteringFlowStateIdsInTwo,
  alteringFlowSectionItemsInTwo,
  alteringFlowSectionIdsInTwo,
  alteringEventsAndTriggersInTwo,
};

// ---------------------------------------------------------------------------
// Exports (Node / CommonJS)
// ---------------------------------------------------------------------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    mergeJson,
    // exported for unit-testing
    findHighestPossibleLogicItemInflowOne,
    alteringLogicItemsInflowTwo,
    alteringFlowStateItemsInTwo,
    alteringFlowStateIdsInTwo,
    alteringFlowSectionItemsInTwo,
    alteringFlowSectionIdsInTwo,
    alteringEventsAndTriggersInTwo,
  };
}
