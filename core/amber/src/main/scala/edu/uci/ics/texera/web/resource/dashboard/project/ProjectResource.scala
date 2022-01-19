package edu.uci.ics.texera.web.resource.dashboard.project

import edu.uci.ics.texera.web.SqlServer
import edu.uci.ics.texera.web.auth.SessionUser
import edu.uci.ics.texera.web.model.jooq.generated.Tables.{
  PROJECT,
  FILE_OF_PROJECT,
  USER_FILE_ACCESS,
  WORKFLOW_OF_PROJECT,
  WORKFLOW_OF_USER
}
import edu.uci.ics.texera.web.model.jooq.generated.tables.daos.{
  FileDao,
  FileOfProjectDao,
  ProjectDao,
  UserDao,
  UserFileAccessDao,
  WorkflowDao,
  WorkflowOfProjectDao,
  WorkflowOfUserDao
}
import edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.{
  FileOfProject,
  Project,
  WorkflowOfProject
}
import edu.uci.ics.texera.web.resource.dashboard.project.ProjectResource.{
  context,
  fileDao,
  fileOfProjectDao,
  projectDao,
  userDao,
  userFileAccessDao,
  workflowDao,
  workflowOfProjectDao,
  workflowOfUserDao
}
import edu.uci.ics.texera.web.resource.dashboard.file.UserFileResource.DashboardFileEntry
import edu.uci.ics.texera.web.resource.dashboard.workflow.WorkflowAccessResource.checkAccessLevel
import edu.uci.ics.texera.web.resource.dashboard.workflow.WorkflowResource.DashboardWorkflowEntry
import org.jooq.types.UInteger

import javax.ws.rs._
import javax.ws.rs.core.MediaType
import java.util
import scala.collection.JavaConverters._
import scala.collection.mutable
import io.dropwizard.auth.Auth

/**
  * This file handles various request related to projects.
  * It sends mysql queries to the MysqlDB regarding the 'project',
  * 'workflow_of_project', and 'file_of_project' Tables
  * The details of these tables can be found in /core/scripts/sql/texera_ddl.sql
  */

object ProjectResource {
  final private val context = SqlServer.createDSLContext()
  final private val userDao = new UserDao(context.configuration)
  final private val projectDao = new ProjectDao(context.configuration)
  final private val workflowOfProjectDao = new WorkflowOfProjectDao(context.configuration)
  final private val fileOfProjectDao = new FileOfProjectDao(context.configuration)
  final private val workflowDao = new WorkflowDao(context.configuration)
  final private val workflowOfUserDao = new WorkflowOfUserDao(context.configuration)
  final private val fileDao = new FileDao(context.configuration)
  final private val userFileAccessDao = new UserFileAccessDao(context.configuration)
}

@Path("/project")
@Produces(Array(MediaType.APPLICATION_JSON))
class ProjectResource {

  /**
    * This method returns the specified project.
    *
    * @param pid project id
    * @return project specified by the project id
    */
  @GET
  @Path("/{pid}")
  def getProject(@PathParam("pid") pid: UInteger): Project = {
    projectDao.fetchOneByPid(pid);
  }

  /**
    * This method returns the list of projects owned by the session user.
    *
    * @param sessionUser
    * @return a list of projects belonging to owner
    */
  @GET
  @Path("/list")
  def listProjectsOwnedByUser(@Auth sessionUser: SessionUser): util.List[Project] = {
    val oid = sessionUser.getUser.getUid
    projectDao.fetchByOwnerId(oid)
  }

//  /**
//    * This method returns the list of projects owned by the specified user.
//    *
//    * @param oid owner id
//    * @return a list of projects belonging to owner
//    */
//  @GET
//  @Path("/list/{oid}")
//  def listProjectsOwnedByUser(@PathParam("oid") oid: UInteger): util.List[Project] = {
//    projectDao.fetchByOwnerId(oid)
//  }

  /**
    * This method returns a list of DashboardWorkflowEntry objects, which represents
    * all the workflows that are part of the specified project.
    *
    * @param pid project ID
    * @param sessionUser
    * @return list of DashboardWorkflowEntry objects
    */
  @GET
  @Path("/workflows/{pid}")
  def listProjectWorkflows(
      @PathParam("pid") pid: UInteger,
      @Auth sessionUser: SessionUser
  ): util.List[DashboardWorkflowEntry] = {
    val workflowMappings = workflowOfProjectDao.fetchByPid(pid)
    val workflows: mutable.ArrayBuffer[DashboardWorkflowEntry] = mutable.ArrayBuffer()
    val uid = sessionUser.getUser.getUid

    workflowMappings.asScala.toList.map(workflowMap => {
      val workflowID = workflowMap.getWid
      val ownerList =
        workflowOfUserDao.fetchByWid(
          workflowID
        ) // should only have one owner per workflow, but just in case
      val ownerName =
        if (ownerList.size() > 0) userDao.fetchOneByUid(ownerList.get(0).getUid).getName else "None"

      workflows += DashboardWorkflowEntry(
        workflowOfUserDao.existsById(
          context.newRecord(WORKFLOW_OF_USER.UID, WORKFLOW_OF_USER.WID).values(uid, workflowID)
        ),
        checkAccessLevel(workflowID, uid).toString,
        ownerName,
        workflowDao.fetchOneByWid(workflowID)
      )
    })

    workflows.toList.asJava
  }

//  /**
//    * This method returns a list of DashboardWorkflowEntry objects, which represents
//    * all the workflows that are inside the specified project.
//    *
//    * Note : since user authentication is not enabled, it temporarily takes in a
//    * user ID
//    *
//    * @param pid project ID
//    * @param uid user ID (in place of authentication)
//    * @return list of DashboardWorkflowEntry objects
//    */
//  @GET
//  @Path("/workflows/{pid}/{uid}")
//  def listProjectWorkflows(
//      @PathParam("pid") pid: UInteger,
//      @PathParam("uid") uid: UInteger
//  ): util.List[DashboardWorkflowEntry] = {
//    val workflowMappings = workflowOfProjectDao.fetchByPid(pid)
//    val workflows: mutable.ArrayBuffer[DashboardWorkflowEntry] = mutable.ArrayBuffer()
//
//    workflowMappings.asScala.toList.map(workflowMap => {
//      val workflowID = workflowMap.getWid
//      val ownerList =
//        workflowOfUserDao.fetchByWid(
//          workflowID
//        ) // should only have one owner per workflow, but just in case
//      val ownerName =
//        if (ownerList.size() > 0) userDao.fetchOneByUid(ownerList.get(0).getUid).getName else "None"
//
//      workflows += DashboardWorkflowEntry(
//        workflowOfUserDao.existsById(
//          context.newRecord(WORKFLOW_OF_USER.UID, WORKFLOW_OF_USER.WID).values(uid, workflowID)
//        ),
//        checkAccessLevel(workflowID, uid).toString,
//        ownerName,
//        workflowDao.fetchOneByWid(workflowID)
//      )
//    })
//
//    workflows.toList.asJava
//  }

  /**
    * This method returns a list of DashboardFileEntry objects, which represents
    * all the file objects that are part of the specified project.
    *
    * @param pid project ID
    * @param sessionUser
    * @return a list of DashboardFileEntry objects
    */
  @GET
  @Path("/files/{pid}")
  def listProjectFiles(
      @PathParam("pid") pid: UInteger,
      @Auth sessionUser: SessionUser
  ): util.List[DashboardFileEntry] = {
    val fileMappings = fileOfProjectDao.fetchByPid(pid)
    val files: mutable.ArrayBuffer[DashboardFileEntry] = mutable.ArrayBuffer()
    val uid = sessionUser.getUser.getUid

    fileMappings.asScala.toList.map(fileMap => {
      val fileID = fileMap.getFid
      val fileObject = fileDao.fetchOneByFid(fileID)
      val ownerName = userDao.fetchOneByUid(fileObject.getUid).getName
      val access = userFileAccessDao.findById(
        context.newRecord(USER_FILE_ACCESS.UID, USER_FILE_ACCESS.FID).values(uid, fileID)
      )
      var accessLevel = "None"
      if (access != null && access.getWriteAccess) {
        accessLevel = "Write"
      } else if (access != null && access.getReadAccess) {
        accessLevel = "Read"
      }

      files += DashboardFileEntry(
        ownerName,
        accessLevel,
        ownerName == userDao.fetchOneByUid(uid).getName,
        fileObject
      )
    })

    files.toList.asJava
  }

//  /**
//    * This method returns a list of DashboardFileEntry objects, which represents
//    * all the file objects that are inside the specified project.
//    *
//    * Note : since user authentication is not enabled, it temporarily takes in a
//    * user ID
//    *
//    * @param pid project ID
//    * @param uid user ID
//    * @return a list of DashboardFileEntry objects
//    */
//  @GET
//  @Path("/files/{pid}/{uid}")
//  def listProjectFiles(
//      @PathParam("pid") pid: UInteger,
//      @PathParam("uid") uid: UInteger
//  ): util.List[DashboardFileEntry] = {
//    val fileMappings = fileOfProjectDao.fetchByPid(pid)
//    val files: mutable.ArrayBuffer[DashboardFileEntry] = mutable.ArrayBuffer()
//
//    fileMappings.asScala.toList.map(fileMap => {
//      val fileID = fileMap.getFid
//      val fileObject = fileDao.fetchOneByFid(fileID)
//      val ownerName = userDao.fetchOneByUid(fileObject.getUid).getName
//      val access = userFileAccessDao.findById(
//        context.newRecord(USER_FILE_ACCESS.UID, USER_FILE_ACCESS.FID).values(uid, fileID)
//      )
//      var accessLevel = "None"
//      if (access != null && access.getWriteAccess) {
//        accessLevel = "Write"
//      } else if (access != null && access.getReadAccess) {
//        accessLevel = "Read"
//      }
//
//      files += DashboardFileEntry(
//        ownerName,
//        accessLevel,
//        ownerName == userDao.fetchOneByUid(uid).getName,
//        fileObject
//      )
//    })
//
//    files.toList.asJava
//  }

  /**
    * This method inserts a new project into the database belonging to the session user
    * and with the specified name.
    *
    * @param sessionUser
    * @param name project name
    */
  @POST
  @Path("/create/{name}")
  def createProject(@Auth sessionUser: SessionUser, @PathParam("name") name: String): Project = {
    val oid = sessionUser.getUser.getUid

    if (
      context.fetchExists(
        context
          .selectOne()
          .from(PROJECT)
          .where(PROJECT.NAME.eq(name), PROJECT.OWNER_ID.eq(oid))
      )
    ) {
      throw new BadRequestException("Cannot create a new workflow with provided name.");
    } else {
      val project = new Project(null, name, oid, null);
      projectDao.insert(project);
      projectDao.fetchOneByPid(project.getPid); // testing this out
    }
  }

//  /**
//    * This method inserts a new project into the database belonging to the specified user
//    * and with the specified name.
//    *
//    * @param oid owner ID
//    * @param name project name
//    */
//  @POST
//  @Path("/create/{oid}/{name}")
//  def createProject(@PathParam("oid") oid: UInteger, @PathParam("name") name: String): Unit = {
//    projectDao.insert(new Project(null, name, oid, null))
//  }

  /**
    * This method adds a mapping between the specified workflow to the specified project
    * into the database.
    *
    * @param pid project ID
    * @param wid workflow ID
    */
  @POST
  @Path("/addWorkflow/{pid}/{wid}")
  def addWorkflowToProject(
      @PathParam("pid") pid: UInteger,
      @PathParam("wid") wid: UInteger
  ): Unit = {
    workflowOfProjectDao.insert(new WorkflowOfProject(wid, pid))
  }

  /**
    * This method adds a mapping between the specified file to the specified project
    * into the database
    *
    * @param pid project ID
    * @param fid file ID
    */
  @POST
  @Path("/addFile/{pid}/{fid}")
  def addFileToProject(@PathParam("pid") pid: UInteger, @PathParam("fid") fid: UInteger): Unit = {
    fileOfProjectDao.insert(new FileOfProject(fid, pid))
  }

  /**
    * This method updates the project name of the specified, existing project
    *
    * @param pid project ID
    * @param name new name
    */
  @POST
  @Path("/update/{pid}/{name}")
  def updateProjectName(@PathParam("pid") pid: UInteger, @PathParam("name") name: String): Unit = {
    val project = projectDao.fetchOneByPid(pid)
    project.setName(name)
    projectDao.update(project)
  }

  /**
    * This method deletes an existing project from the database
    *
    * @param pid projectID
    */
  @DELETE
  @Path("/delete/{pid}")
  def deleteProject(@PathParam("pid") pid: UInteger): Unit = {
    projectDao.deleteById(pid)
  }

  /**
    * This method deletes an existing mapping between a workflow and project from
    * the database
    *
    * @param pid project ID
    * @param wid workflow ID
    */
  @DELETE
  @Path("/deleteWorkflow/{pid}/{wid}")
  def deleteWorkflowFromProject(
      @PathParam("pid") pid: UInteger,
      @PathParam("wid") wid: UInteger
  ): Unit = {
    workflowOfProjectDao.deleteById(
      context.newRecord(WORKFLOW_OF_PROJECT.WID, WORKFLOW_OF_PROJECT.PID).values(wid, pid)
    )
  }

  /**
    * This method deletes an existing mapping between a file and a project from
    * the database
    *
    * @param pid project ID
    * @param fid file ID
    */
  @DELETE
  @Path("/deleteFile/{pid}/{fid}")
  def deleteFileFromProject(
      @PathParam("pid") pid: UInteger,
      @PathParam("fid") fid: UInteger
  ): Unit = {
    fileOfProjectDao.deleteById(
      context.newRecord(FILE_OF_PROJECT.FID, FILE_OF_PROJECT.PID).values(fid, pid)
    )
  }

}
