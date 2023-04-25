Nest microservices template

# Auto Changelogs
Auto changelogs is part of gitlab pipeline. There two different steps: Commits and Tags.

For Commits step - it is grabs every force push or merged request to project's default branch (main or master) and fills it to "Unreleased" topic on top of changelog

For Tags step - it triggers on each tag creation for default branch and changing "Unreleased" topic to fresh tag's one


## [To make it work - each repo should be configured for it:](https://fbet-gitlab.ex2b.co/help/user/project/deploy_keys/index#create-a-project-deploy-key)

You should create project's key pair:
```shell
ssh-keygen -f deploy_key -N ""
```
Then .pub key should be set on Settings => Repository => Deploy Keys
Grant write permissions for this key

Then you should create CI_CD expanded variable `SSH_PRIVATE_KEY_TOOLKIT` and put private part of key on it