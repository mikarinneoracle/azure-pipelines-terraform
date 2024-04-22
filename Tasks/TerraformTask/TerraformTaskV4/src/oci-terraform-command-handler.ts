import tasks = require('azure-pipelines-task-lib/task');
import {ToolRunner} from 'azure-pipelines-task-lib/toolrunner';
import {TerraformAuthorizationCommandInitializer} from './terraform-commands';
import {BaseTerraformCommandHandler} from './base-terraform-command-handler';

export class TerraformCommandHandlerOCI extends BaseTerraformCommandHandler {
    constructor() {
        super();
        this.providerName = "oci";
    }

    private setupBackend(backendServiceName: string) {
        this.backendConfig.set('pat', tasks.getInput("backendOCIPAT", true));
        this.backendConfig.set('region', tasks.getEndpointAuthorizationParameter(backendServiceName, "region", true));
        this.backendConfig.set('user', tasks.getEndpointAuthorizationParameter(backendServiceName, "user", true));
        this.backendConfig.set('tenancy', tasks.getEndpointAuthorizationParameter(backendServiceName, "tenancy", true));
        this.backendConfig.set('fingerprint', tasks.getEndpointAuthorizationParameter(backendServiceName, "fingerprint", true));
        this.backendConfig.set('key', tasks.getEndpointAuthorizationParameter(backendServiceName, "key", true));
    }

    public async handleBackend(terraformToolRunner: ToolRunner) : Promise<void> {
        let backendServiceName = tasks.getInput("backendServiceOCI", true);
        this.setupBackend(backendServiceName);

        for (let [key, value] of this.backendConfig.entries()) {
            terraformToolRunner.arg(`-backend-config=${key}=${value}`);
        }
    }

    public async handleProvider(command: TerraformAuthorizationCommandInitializer) : Promise<void> {
        if (command.serviceProvidername) {
            /*
            OCI_CLI_USER
            OCI_CLI_TENANCY
            OCI_CLI_FINGERPRINT
            OCI_CLI_KEY_CONTENT
            OCI_CLI_REGION
            */
            process.env['OCI_CLI_USER']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "user", false);
            process.env['OCI_CLI_TENANCY']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "tenancy", false);        
            process.env['OCI_CLI_FINGERPRINT']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "fingerprint", false);
            process.env['OCI_CLI_KEY_CONTENT']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "key", false);        
            process.env['OCI_CLI_REGION']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "region", false);  
        }
    }
}