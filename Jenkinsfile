// PR pipeline. Production releases use Jenkinsfile.legacy; both pipelines are required.
//
// Quality gate (configured on the SonarQube server, project agi-gw-insurancesuite; this pipeline only
// waits for its verdict and aborts on failure):
//   - Coverage on new code                >= 80%
//   - Duplicated lines on new code        <= 3%
//   - New bugs / vulnerabilities          = 0
//   - Security hotspots reviewed (new)    = 100%
pipeline {
  agent { label 'gw-build && jdk11' }
  options { timeout(time: 4, unit: 'HOURS') }   // full four-centre compile + test
  environment {
    SONAR_SERVER = 'agi-sonarqube'              // Jenkins > Configure System > SonarQube servers
  }
  stages {
    stage('Brand config drift') { steps { sh 'python3 tools/scripts/check_brand_config_drift.py' } }
    stage('Guidewire coherence') { steps { sh 'python3 tools/scripts/check_gw_coherence.py .' } }
    stage('Offline replay + builder JUnit') {
      // GOSU_LIB: agent directory holding the open-source Gosu and JUnit jars (tools/replay/README.md)
      steps {
        sh 'GOSU_LIB="${GOSU_LIB:-$HOME/gosu-lib}" tools/replay/run_replay.sh'
        sh 'GOSU_LIB="${GOSU_LIB:-$HOME/gosu-lib}" tools/replay/junit/run_junit.sh'
      }
    }

    stage('Compile CC') { steps { sh 'sh ./gwb compile -Dcenter=cc' } }
    stage('Compile PC') { steps { sh 'sh ./gwb compile -Dcenter=pc' } }
    stage('Compile BC') { steps { sh 'sh ./gwb compile -Dcenter=bc' } }
    stage('Compile CM') { steps { sh 'sh ./gwb compile -Dcenter=cm' } }

    stage('GUnit CC') { steps { sh 'sh ./gwb test -Dcenter=cc --init-script tools/ci/coverage.init.gradle' } }
    stage('GUnit PC') { steps { sh 'sh ./gwb test -Dcenter=pc --init-script tools/ci/coverage.init.gradle' } }
    stage('GUnit BC') { steps { sh 'sh ./gwb test -Dcenter=bc --init-script tools/ci/coverage.init.gradle' } }
    stage('GUnit CM') { steps { sh 'sh ./gwb test -Dcenter=cm --init-script tools/ci/coverage.init.gradle' } }

    stage('Sonar') {
      steps {
        withSonarQubeEnv("${SONAR_SERVER}") {
          sh 'sonar-scanner -Dproject.settings=sonar-project.properties'
        }
      }
    }
    stage('Quality gate') {
      steps {
        timeout(time: 30, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
  post {
    always {
      junit testResults: 'build/test-results/**/*.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'build/reports/jacoco/*/jacocoTestReport.xml', allowEmptyArchive: true, fingerprint: true
    }
    failure { mail to: 'gw-build-support@albiongeneral.example', subject: "GW suite build failed", body: "${env.BUILD_URL}" }
  }
}
