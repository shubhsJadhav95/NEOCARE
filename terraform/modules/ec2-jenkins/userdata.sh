#!/bin/bash
set -e

# ── System update ──
yum update -y

# ── Java 17 (required for Jenkins) ──
yum install -y java-17-amazon-corretto

# ── Jenkins ──
wget -O /etc/yum.repos.d/jenkins.repo \
  https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install -y jenkins
systemctl enable jenkins
systemctl start jenkins

# ── Docker ──
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker jenkins
usermod -aG docker ubuntu

# ── kubectl ──
curl -sLO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/kubectl

# ── AWS CLI v2 ──
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# ── Helm (for deploying to EKS from Jenkins pipelines) ──
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── SSM Agent ──
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# ── Git ──
yum install -y git

# ── Print initial admin password location to log ──
echo "Jenkins initial admin password is at: /var/lib/jenkins/secrets/initialAdminPassword" \
  >> /var/log/userdata.log

echo "Jenkins bootstrap complete." >> /var/log/userdata.log
