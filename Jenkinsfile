// New pipeline (2023) - runs on PRs. PROD releases still use Jenkinsfile.legacy. Both required.
pipeline {
  agent { label 'gw-build && jdk11' }
  options { timeout(time: 4, unit: 'HOURS') }   // full suite compile really does take this long
  stages {
    stage('Compile CC')   { steps { sh './gwb compile -Dcenter=cc' } }
    stage('Compile PC')   { steps { sh './gwb compile -Dcenter=pc' } }
    stage('Compile BC')   { steps { sh './gwb compile -Dcenter=bc' } }
    stage('Compile CM')   { steps { sh './gwb compile -Dcenter=cm' } }
    stage('GUnit (subset)') { steps { sh './gwb test -Dsuite=smoke || true' } }  // || true added 2021 "temporarily"
    stage('Sonar') { steps { sh 'sonar-scanner -Dproject.settings=sonar-project.properties' } }
  }
  post { failure { mail to: 'gw-build-support@albiongeneral.example', subject: "Build broken again" } }
}
