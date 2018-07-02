import { ModelApiInterface, Event } from "deus-engine-manager-api";
import { hasMedicViewModel } from "../helpers/view-model-helper";
import { OrganismModel, BiologicalSystems, systemsIndices } from "../helpers/magellan";
import * as shuffle from 'shuffle-array'

interface RunLabTestData {
  test: string;
  model: OrganismModel;
}

interface TestResult {
  type: string;
  message: string;
}

function nucleotideTest(model: OrganismModel): string {
  return 'Результат: ' + shuffle(systemsIndices().map((s) => model.systems[s].nucleotide)).join(', ');
}

function genericTest(model: OrganismModel, systems: BiologicalSystems[]): string {
  return 'Результат: ' + shuffle(systems.map((s) => model.systems[s].value), { copy: true }).join(', ');
}

const tests = {
  nucleotide: (model: OrganismModel): TestResult => {
    return {
      type: 'Анализ нуклеотида',
      message: nucleotideTest(model),
    }
  },
  test1: (model: OrganismModel): TestResult => {
    return {
      type: "Тест 1",
      message: genericTest(model, [BiologicalSystems.Nervous, BiologicalSystems.Musculoskeletal, BiologicalSystems.Integumentary])
    }
  },
  test2: (model: OrganismModel): TestResult => {
    return {
      type: "Тест 2",
      message: genericTest(model, [BiologicalSystems.Respiratory, BiologicalSystems.Cardiovascular, BiologicalSystems.Nervous])
    }
  },
  test3: (model: OrganismModel): TestResult => {
    return {
      type: "Тест 3",
      message: genericTest(model, [BiologicalSystems.Cardiovascular, BiologicalSystems.Musculoskeletal, BiologicalSystems.Reproductive])
    }
  },
  test4: (model: OrganismModel): TestResult => {
    return {
      type: "Тест 4",
      message: genericTest(model, [BiologicalSystems.Integumentary, BiologicalSystems.Respiratory, BiologicalSystems.Digestive])
    }
  },
  test5: (model: OrganismModel): TestResult => {
    return {
      type: "Тест 5",
      message: genericTest(model, [BiologicalSystems.Digestive, BiologicalSystems.Reproductive, BiologicalSystems.Nervous])
    }
  },

}

function medicRunLabTest(api: ModelApiInterface, data: RunLabTestData, event: Event) {
  if (!hasMedicViewModel(api.model)) {
    api.error("medic-run-lab-test event sent to non-medic account");
    return;
  }

  if (api.model.numTests <= 0) {
    const historyEntry = {
      timestamp: event.timestamp,
      patientId: data.model._id,
      patientFullName: data.model.firstName + ' ' + data.model.lastName,
      type: "Ошибка",
      text: "Недостачно реактивов для проведения анализа",
    };
    api.model.patientHistory.push(historyEntry);
    return;
  } else {
    api.model.numTests--;
  }

  const testFunction = tests[data.test];
  if (testFunction == undefined) {
    api.error(`medic-run-lab-test: unknown test "${data.test}"`);
    return;
  }

  const testResult: TestResult = testFunction(data.model);

  const historyEntry = {
    timestamp: event.timestamp,
    patientId: data.model._id,
    patientFullName: data.model.firstName + ' ' + data.model.lastName,
    type: testResult.type,
    text: testResult.message,
  }

  api.model.patientHistory.push(historyEntry);
}


interface AddCommentData {
  text: string;
  model: any;
}

function medicAddComment(api: ModelApiInterface, data: AddCommentData, event: Event) {
  if (!hasMedicViewModel(api.model)) {
    api.error("medic-add-comment event sent to non-medic account");
    return;
  }

  const historyEntry = {
    timestamp: event.timestamp,
    patientId: data.model._id,
    patientFullName: data.model.firstName + ' ' + data.model.lastName,
    text: data.text,
    type: 'Комментарий',
  }

  api.model.patientHistory.push(historyEntry);
}


interface LabTerminalRefillData {
  uniquId: string;
  numTests: number;
}

function labTerminalRefill(api: ModelApiInterface,
  data: LabTerminalRefillData, _: Event) {
    // TODO(aeremin): Check if uniqueId is aquiredFt
    api.model.numTests += data.numTests;
}


module.exports = () => {
  return {
    medicRunLabTest,
    medicAddComment,
    labTerminalRefill,
  };
};

