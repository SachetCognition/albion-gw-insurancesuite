// PR pipeline (2023). Production releases use Jenkinsfile.legacy; both pipelines are required.
pipeline {
  agent { label 'gw-build && jdk11' }
  options { timeout(time: 4, unit: 'HOURS') }   // full four-centre compile
  stages {
    stage('Compile CC')   { steps { sh './gwb compile -Dcenter=cc' } }
    stage('Compile PC')   { steps { sh './gwb compile -Dcenter=pc' } }
    stage('Compile BC')   { steps { sh './gwb compile -Dcenter=bc' } }
    stage('Compile CM')   { steps { sh './gwb compile -Dcenter=cm' } }
    stage('GUnit (subset)') { steps { sh './gwb test -Dsuite=smoke || true' } }  // smoke failures are non-blocking (since 2021)
    stage('Sonar') { steps { sh 'sonar-scanner -Dproject.settings=sonar-project.properties' } }
  }
  post { failure { mail to: 'gw-build-support@albiongeneral.example', subject: "GW suite build failed" } }
}
