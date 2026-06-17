```bash
#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

# ── System update ──
apt-get update
apt-get upgrade -y

# ── Install prerequisites ──
apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    gnupg \
    lsb-release \
    ca-certificates \
    software-properties-common

# ── Java 17 (required for Jenkins) ──
apt-get install -y openjdk-17-jdk

# ── Jenkins ──
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
    | tee /usr/share/keyrings/jenkins-keyring.asc >/dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
    > /etc/apt/sources.list.d/jenkins.list

apt-get update
apt-get install -y jenkins

systemctl enable jenkins
systemctl start jenkins

# ── Docker ──
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /usr/share/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update

apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

systemctl enable docker
systemctl start docker

usermod -aG docker jenkins
usermod -aG docker ubuntu

# ── kubectl ──
curl -sLO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -m 0755 kubectl /usr/local/bin/kubectl
rm -f kubectl

# ── AWS CLI v2 ──
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
    -o /tmp/awscliv2.zip

unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# ── Helm ──
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── AWS SSM Agent ──
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

# ── Verify installations ──
java -version
docker --version
kubectl version --client
aws --version
helm version
git --version

# ── Jenkins initial admin password ──
echo "Jenkins initial admin password:"
cat /var/lib/jenkins/secrets/initialAdminPassword

echo "Jenkins bootstrap complete." >> /var/log/user-data.log
```
