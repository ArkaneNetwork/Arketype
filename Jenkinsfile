pipeline {
    agent any
    environment {
        GITHUB_CREDS = credentials('GITHUB_CRED')
    }
    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
    }
    stages {
        stage('Docker Build') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'master'
                    branch 'hotfix-*'
                    branch 'release-*'
                }
            }
            steps {
                sh 'ls -l'
                sh 'docker build -t arkanenetwork/arkane-arketype:${BRANCH_NAME} .'
            }
        }
        stage('Docker Push') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'master'
                    branch 'hotfix-*'
                    branch 'release-*'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerHub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
                    sh "docker push arkanenetwork/arkane-arketype:${BRANCH_NAME} && echo 'pushed'"
                }
            }
        }
        stage('Merge back to develop') {
            when {
                anyOf {
                    branch 'hotfix-*'
                    branch 'release-*'
                }
            }
            steps {
                withCredentials([gitUsernamePassword(credentialsId: 'GITHUB_CRED', gitToolName: 'Default')]) {
                    sh 'git reset --hard'
                    sh 'git fetch --no-tags origin develop:develop'
                    sh 'git checkout develop'
                    sh 'git merge ${GIT_COMMIT}'
                    sh 'git push origin develop:develop'
                }
            }
        }
    }
    post {
        cleanup {
            cleanWs(deleteDirs: true, patterns: [[pattern: '.git', type: 'INCLUDE']])
        }
    }
}
